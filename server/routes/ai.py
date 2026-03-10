from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import http.client
import json
import os

ai_bp = Blueprint('ai', __name__)

def call_groq(prompt):
    body = json.dumps({
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024
    })
    conn = http.client.HTTPSConnection("api.groq.com")
    headers = {
        "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
        "Content-Type": "application/json"
    }
    conn.request("POST", "/openai/v1/chat/completions", body, headers)
    res = conn.getresponse()
    data = json.loads(res.read().decode("utf-8"))
    if "error" in data:
        raise Exception(data["error"]["message"])
    return data["choices"][0]["message"]["content"]

@ai_bp.route('/symptom-check', methods=['POST'])
@jwt_required()
def symptom_check():
    data = request.json
    symptoms = data.get('symptoms', '')
    age = data.get('age', 'adult')
    gender = data.get('gender', 'person')

    prompt = f"""You are a medical AI assistant. A {age} year old {gender} has these symptoms: {symptoms}.

Please provide:
1. Possible conditions (list 3-5)
2. Severity level (Mild/Moderate/Severe)
3. Recommended specialist to consult
4. Immediate home remedies
5. Warning signs to watch for

Important: Always recommend seeing a doctor. This is not a substitute for professional medical advice."""

    try:
        result = call_groq(prompt)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'message': f'AI error: {str(e)}'}), 500

@ai_bp.route('/health-tips', methods=['POST'])
@jwt_required()
def health_tips():
    data = request.json
    condition = data.get('condition', '')
    prompt = f"Give 5 practical daily health tips for someone with {condition}. Be concise and actionable."
    try:
        result = call_groq(prompt)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'message': 'AI unavailable'}), 500
