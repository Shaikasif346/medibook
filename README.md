# 🏥 MediBook — Python Flask Healthcare Platform

Full-stack healthcare app with Python Flask backend + React frontend.

## 🛠️ Tech Stack
- **Backend:** Python + Flask + Flask-SocketIO
- **Frontend:** React.js (PWA)
- **Database:** MongoDB Atlas
- **AI:** Groq API (LLaMA3)
- **Payments:** Razorpay
- **Auth:** JWT (Flask-JWT-Extended)

## ⚙️ Setup

### Backend (Python)
```bash
cd server
pip install -r requirements.txt
cp .env.example .env
# Fill in your keys in .env
python app.py
```

### Create Admin
```bash
cd server
python create_admin.py
# Login: admin@medibook.com / admin123
```

### Frontend (React)
```bash
cd client
npm install
npm start
```

## 🌍 Deploy
- **Backend:** Render.com → Python service → `gunicorn app:app`
- **Frontend:** Vercel.com → Root: `client`

## 👨‍💻 Developer
Shaik Mohammad Asif — github.com/Shaikasif346
