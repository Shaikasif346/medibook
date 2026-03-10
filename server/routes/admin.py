from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db import get_db

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    from functools import wraps
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        db = get_db()
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def stats():
    db = get_db()
    total_users = db.users.count_documents({'role': 'patient'})
    total_doctors = db.doctors.count_documents({})
    total_appointments = db.appointments.count_documents({})
    pending_doctors = db.doctors.count_documents({'isVerified': False})

    revenue_pipeline = [{'$match': {'paymentStatus': 'paid'}}, {'$group': {'_id': None, 'total': {'$sum': '$fee'}}}]
    rev = list(db.appointments.aggregate(revenue_pipeline))
    revenue = rev[0]['total'] if rev else 0

    recent = list(db.appointments.find().sort('createdAt', -1).limit(5))
    recent_list = []
    for a in recent:
        a['_id'] = str(a['_id'])
        if 'date' in a and isinstance(a['date'], datetime): a['date'] = a['date'].isoformat()
        doc = db.doctors.find_one({'_id': ObjectId(a['doctor_id'])})
        if doc:
            user = db.users.find_one({'_id': ObjectId(doc['user_id'])})
            a['doctor'] = {'user': {'name': user['name'] if user else 'Unknown'}}
        patient = db.users.find_one({'_id': ObjectId(a['patient_id'])})
        a['patient'] = {'name': patient['name'] if patient else 'Unknown'}
        recent_list.append(a)

    return jsonify({'totalUsers': total_users, 'totalDoctors': total_doctors,
        'totalAppointments': total_appointments, 'pendingDoctors': pending_doctors,
        'revenue': revenue, 'recentAppointments': recent_list})

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    db = get_db()
    users = list(db.users.find({}, {'password': 0}).sort('createdAt', -1))
    for u in users:
        u['_id'] = str(u['_id'])
        if 'createdAt' in u and isinstance(u['createdAt'], datetime): u['createdAt'] = u['createdAt'].isoformat()
    return jsonify(users)

@admin_bp.route('/doctors', methods=['GET'])
@admin_required
def get_doctors():
    db = get_db()
    doctors = list(db.doctors.find().sort('createdAt', -1))
    result = []
    for doc in doctors:
        doc['_id'] = str(doc['_id'])
        user = db.users.find_one({'_id': ObjectId(doc['user_id'])})
        if user:
            doc['user'] = {'name': user['name'], 'email': user.get('email',''), 'phone': user.get('phone',''), 'createdAt': user.get('createdAt', datetime.utcnow()).isoformat()}
        result.append(doc)
    return jsonify(result)

@admin_bp.route('/doctors/<doctor_id>/verify', methods=['PUT'])
@admin_required
def verify_doctor(doctor_id):
    db = get_db()
    db.doctors.update_one({'_id': ObjectId(doctor_id)}, {'$set': {'isVerified': True}})
    return jsonify({'message': 'Doctor verified!'})

@admin_bp.route('/doctors/<doctor_id>/reject', methods=['PUT'])
@admin_required
def reject_doctor(doctor_id):
    db = get_db()
    db.doctors.update_one({'_id': ObjectId(doctor_id)}, {'$set': {'isVerified': False, 'isAvailable': False}})
    return jsonify({'message': 'Doctor rejected'})

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    db = get_db()
    db.users.delete_one({'_id': ObjectId(user_id)})
    return jsonify({'message': 'User removed'})

@admin_bp.route('/appointments', methods=['GET'])
@admin_required
def get_appointments():
    db = get_db()
    appts = list(db.appointments.find().sort('createdAt', -1).limit(50))
    result = []
    for a in appts:
        a['_id'] = str(a['_id'])
        if 'date' in a and isinstance(a['date'], datetime): a['date'] = a['date'].isoformat()
        doc = db.doctors.find_one({'_id': ObjectId(a['doctor_id'])})
        if doc:
            user = db.users.find_one({'_id': ObjectId(doc['user_id'])})
            a['doctor'] = {'user': {'name': user['name'] if user else '?'}}
        patient = db.users.find_one({'_id': ObjectId(a['patient_id'])})
        a['patient'] = {'name': patient['name'] if patient else '?', 'email': patient.get('email','') if patient else ''}
        result.append(a)
    return jsonify(result)

@admin_bp.route('/revenue', methods=['GET'])
@admin_required
def get_revenue():
    db = get_db()
    pipeline = [
        {'$match': {'paymentStatus': 'paid'}},
        {'$group': {'_id': {'month': {'$month': '$createdAt'}, 'year': {'$year': '$createdAt'}}, 'total': {'$sum': '$fee'}, 'count': {'$sum': 1}}},
        {'$sort': {'_id.year': 1, '_id.month': 1}}
    ]
    result = list(db.appointments.aggregate(pipeline))
    return jsonify(result)
