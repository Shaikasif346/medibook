import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = None
db = None

def get_db():
    global client, db
    if db is None:
        uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/medibook')
        client = MongoClient(uri)
        db = client.get_database()
        print("MongoDB connected!")
    return db
