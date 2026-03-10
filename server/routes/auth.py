from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson import ObjectId
import bcrypt
from datetime import datetime
from db import get_db

auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def user_to_dict(user):
    if not user: return None
    user['_id'] = str(user['_id'])
    user.pop('password', None)
    return user

@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    data = request.json
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'patient')

    if not name or not email or not password:
        return jsonify({'message': 'All fields required'}), 400

    if db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already exists'}), 400

    user = {
        'name': name, 'email': email,
        'password': hash_password(password),
        'phone': data.get('phone', ''),
        'role': role, 'avatar': '',
        'createdAt': datetime.utcnow()
    }
    result = db.users.insert_one(user)
    user_id = str(result.inserted_id)

    # Create doctor profile if doctor
    if role == 'doctor':
        db.doctors.insert_one({
            'user_id': user_id,
            'specialty': data.get('specialty', 'General'),
            'consultationFee': int(data.get('consultationFee', 500)),
            'experience': int(data.get('experience', 0)),
            'hospital': data.get('hospital', ''),
            'location': {'city': data.get('city', ''), 'address': '', 'lat': 0, 'lng': 0},
            'rating': 0, 'totalReviews': 0,
            'isVerified': False, 'isAvailable': True,
            'about': '', 'qualifications': [],
            'availability': [], 'languages': ['English'],
            'createdAt': datetime.utcnow()
        })

    token = create_access_token(identity=user_id)
    return jsonify({'token': token, 'user': {'_id': user_id, 'name': name, 'email': email, 'role': role}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    db = get_db()
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = db.users.find_one({'email': email})
    if not user or not check_password(password, user['password']):
        return jsonify({'message': 'Invalid credentials'}), 400

    user_id = str(user['_id'])
    token = create_access_token(identity=user_id)
    return jsonify({'token': token, 'user': {'_id': user_id, 'name': user['name'], 'email': user['email'], 'role': user['role']}})

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    db = get_db()
    user_id = get_jwt_identity()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'message': 'User not found'}), 404
    result = user_to_dict(dict(user))
    if user['role'] == 'doctor':
        doctor = db.doctors.find_one({'user_id': user_id})
        if doctor:
            doctor['_id'] = str(doctor['_id'])
            result['doctorProfile'] = doctor
    return jsonify(result)
