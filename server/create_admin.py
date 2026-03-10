# Run once: python create_admin.py
import os
from dotenv import load_dotenv
load_dotenv()

from pymongo import MongoClient
import bcrypt
from datetime import datetime

client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_database()

if db.users.find_one({'email': 'admin@medibook.com'}):
    print('Admin already exists!')
else:
    hashed = bcrypt.hashpw('admin123'.encode(), bcrypt.gensalt()).decode()
    db.users.insert_one({
        'name': 'Admin', 'email': 'admin@medibook.com',
        'password': hashed, 'role': 'admin',
        'phone': '', 'avatar': '', 'createdAt': datetime.utcnow()
    })
    print('✅ Admin created!')
    print('Email: admin@medibook.com')
    print('Password: admin123')
