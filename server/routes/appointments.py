from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import uuid
from db import get_db

appointments_bp = Blueprint('appointments', __name__)

def format_appointment(appt, db):
    if not appt: return None
    appt['_id'] = str(appt['_id'])
    if 'date' in appt and isinstance(appt['date'], datetime):
        appt['date'] = appt['date'].isoformat()
    # Populate doctor
    doctor = db.doctors.find_one({'_id': ObjectId(appt['doctor_id'])})
    if doctor:
        doctor['_id'] = str(doctor['_id'])
        user = db.users.find_one({'_id': ObjectId(doctor['user_id'])})
        if user:
            doctor['user'] = {'_id': str(user['_id']), 'name': user['name'], 'avatar': user.get('avatar','')}
        appt['doctor'] = doctor
    # Populate patient
    patient = db.users.find_one({'_id': ObjectId(appt['patient_id'])})
    if patient:
        appt['patient'] = {'_id': str(patient['_id']), 'name': patient['name'], 'email': patient.get('email',''), 'phone': patient.get('phone','')}
    return appt

@appointments_bp.route('/book', methods=['POST'])
@jwt_required()
def book():
    db = get_db()
    user_id = get_jwt_identity()
    data = request.json
    doctor_id = data.get('doctorId')
    doctor = db.doctors.find_one({'_id': ObjectId(doctor_id)})
    if not doctor:
        return jsonify({'message': 'Doctor not found'}), 404

    room_id = uuid.uuid4().hex[:8].upper()
    appt = {
        'patient_id': user_id, 'doctor_id': doctor_id,
        'date': datetime.fromisoformat(data.get('date')),
        'timeSlot': data.get('timeSlot'),
        'type': data.get('type', 'video'),
        'symptoms': data.get('symptoms', ''),
        'status': 'pending',
        'fee': doctor.get('consultationFee', 500),
        'paymentStatus': 'pending',
        'paymentId': '', 'roomId': room_id,
        'prescription': '', 'notes': '',
        'createdAt': datetime.utcnow()
    }
    result = db.appointments.insert_one(appt)
    appt['_id'] = str(result.inserted_id)
    return jsonify(format_appointment(appt, db)), 201

@appointments_bp.route('/my', methods=['GET'])
@jwt_required()
def my_appointments():
    db = get_db()
    user_id = get_jwt_identity()
    appts = list(db.appointments.find({'patient_id': user_id}).sort('date', -1))
    return jsonify([format_appointment(dict(a), db) for a in appts])

@appointments_bp.route('/doctor', methods=['GET'])
@jwt_required()
def doctor_appointments():
    db = get_db()
    user_id = get_jwt_identity()
    doctor = db.doctors.find_one({'user_id': user_id})
    if not doctor:
        return jsonify({'message': 'Doctor not found'}), 404
    doctor_id = str(doctor['_id'])
    appts = list(db.appointments.find({'doctor_id': doctor_id}).sort('date', -1))
    return jsonify([format_appointment(dict(a), db) for a in appts])

@appointments_bp.route('/<appt_id>/status', methods=['PUT'])
@jwt_required()
def update_status(appt_id):
    db = get_db()
    data = request.json
    update = {}
    if 'status' in data: update['status'] = data['status']
    if 'prescription' in data: update['prescription'] = data['prescription']
    if 'notes' in data: update['notes'] = data['notes']
    db.appointments.update_one({'_id': ObjectId(appt_id)}, {'$set': update})
    appt = db.appointments.find_one({'_id': ObjectId(appt_id)})
    return jsonify(format_appointment(dict(appt), db))

@appointments_bp.route('/<appt_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel(appt_id):
    db = get_db()
    db.appointments.update_one({'_id': ObjectId(appt_id)}, {'$set': {'status': 'cancelled'}})
    return jsonify({'message': 'Cancelled'})
