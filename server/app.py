import os
import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from dotenv import load_dotenv
from db import get_db

load_dotenv()

app = Flask(__name__)
CORS(app, origins="*")
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'medibook_secret_123')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Register routes
from routes.auth import auth_bp
from routes.doctors import doctors_bp
from routes.appointments import appointments_bp
from routes.payment import payment_bp
from routes.ai import ai_bp
from routes.admin import admin_bp
from socket_handler import register_socket_events

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(doctors_bp, url_prefix='/api/doctors')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
app.register_blueprint(payment_bp, url_prefix='/api/payment')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

register_socket_events(socketio)

@app.route('/api/health')
def health():
    return {'status': 'OK', 'app': 'MediBook Python'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
