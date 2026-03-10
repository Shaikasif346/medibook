from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db import get_db

doctors_bp = Blueprint('doctors', __name__)

def format_doctor(doc, db):
    if not doc: return None
    doc['_id'] = str(doc['_id'])
    user = db.users.find_one({'_id': ObjectId(doc['user_id'])})
    if user:
        doc['user'] = {'_id': str(user['_id']), 'name': user['name'], 'email': user.get('email',''), 'phone': user.get('phone','')}
    return doc

@doctors_bp.route('/', methods=['GET'])
def get_doctors():
    db = get_db()
    query = {'isAvailable': True}
    specialty = request.args.get('specialty', '')
    city = request.args.get('city', '')
    search = request.args.get('search', '')

    if specialty:
        query['specialty'] = {'$regex': specialty, '$options': 'i'}
    if city:
        query['location.city'] = {'$regex': city, '$options': 'i'}

    doctors = list(db.doctors.find(query).sort('rating', -1))
    result = []
    for doc in doctors:
        d = format_doctor(dict(doc), db)
        if search:
            name = d.get('user', {}).get('name', '').lower()
            spec = d.get('specialty', '').lower()
            hosp = d.get('hospital', '').lower()
            if search.lower() not in name and search.lower() not in spec and search.lower() not in hosp:
                continue
        result.append(d)
    return jsonify(result)

@doctors_bp.route('/meta/specialties', methods=['GET'])
def get_specialties():
    specialties = ['General Physician','Cardiologist','Dermatologist','Neurologist',
        'Orthopedic','Pediatrician','Psychiatrist','Gynecologist',
        'Ophthalmologist','ENT Specialist','Dentist','Urologist']
    return jsonify(specialties)

@doctors_bp.route('/<doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    db = get_db()
    try:
        doc = db.doctors.find_one({'_id': ObjectId(doctor_id)})
        if not doc:
            return jsonify({'message': 'Doctor not found'}), 404
        doctor = format_doctor(dict(doc), db)
        reviews_cursor = db.reviews.find({'doctor_id': doctor_id}).sort('createdAt', -1).limit(10)
        reviews = []
        for r in reviews_cursor:
            r['_id'] = str(r['_id'])
            patient = db.users.find_one({'_id': ObjectId(r['patient_id'])})
            r['patient'] = {'name': patient['name'] if patient else 'Unknown'}
            reviews.append(r)
        return jsonify({'doctor': doctor, 'reviews': reviews})
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@doctors_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    db = get_db()
    user_id = get_jwt_identity()
    data = request.json
    data.pop('_id', None)
    data.pop('user_id', None)
    db.doctors.update_one({'user_id': user_id}, {'$set': data})
    doctor = db.doctors.find_one({'user_id': user_id})
    return jsonify(format_doctor(dict(doctor), db))

@doctors_bp.route('/<doctor_id>/review', methods=['POST'])
@jwt_required()
def add_review(doctor_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.json
    review = {
        'patient_id': user_id, 'doctor_id': doctor_id,
        'rating': data.get('rating', 5),
        'comment': data.get('comment', ''),
        'createdAt': datetime.utcnow()
    }
    db.reviews.insert_one(review)
    reviews = list(db.reviews.find({'doctor_id': doctor_id}))
    avg = sum(r['rating'] for r in reviews) / len(reviews)
    db.doctors.update_one({'_id': ObjectId(doctor_id)}, {'$set': {'rating': round(avg, 1), 'totalReviews': len(reviews)}})
    return jsonify({'message': 'Review added'}), 201
