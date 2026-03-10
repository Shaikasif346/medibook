from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db import get_db

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-order', methods=['POST'])
@jwt_required()
def create_order():
    db = get_db()
    data = request.json
    appt_id = data.get('appointmentId')
    appt = db.appointments.find_one({'_id': ObjectId(appt_id)})
    if not appt:
        return jsonify({'message': 'Appointment not found'}), 404

    import os, time
    return jsonify({
        'orderId': f'order_{int(time.time())}',
        'amount': appt.get('fee', 500) * 100,
        'currency': 'INR',
        'key': os.getenv('RAZORPAY_KEY_ID', 'rzp_test_demo'),
        'appointmentId': appt_id
    })

@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify():
    db = get_db()
    data = request.json
    appt_id = data.get('appointmentId')
    payment_id = data.get('paymentId')

    db.appointments.update_one(
        {'_id': ObjectId(appt_id)},
        {'$set': {'paymentStatus': 'paid', 'paymentId': payment_id, 'status': 'confirmed'}}
    )
    appt = db.appointments.find_one({'_id': ObjectId(appt_id)})
    return jsonify({'message': 'Payment successful!', 'status': 'confirmed'})
