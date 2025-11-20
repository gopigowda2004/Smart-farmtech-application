
🌾 FarmTech – Agricultural Equipment Rental Platform with AI Chatbot (EN/KN)

FarmTech is a full-stack agricultural equipment rental platform designed to help farmers rent equipment easily, affordably, and in their own language.
It combines Java Spring Boot, React.js, MySQL, and a Python Flask bilingual AI chatbot (English + Kannada) to deliver an end-to-end solution for farmers and equipment owners.

🚀 Features
✅ Core Platform Features

👤 User Authentication (Farmer/Owner roles)

🚜 Add & Manage Equipment Listings

📍 Location-Based Equipment Search

📅 Real-Time Booking System

✉️ Email Notifications (Booking confirmation, updates)

📊 Dashboard for Farmers & Owners

💬 AI Chatbot Assistant (English & Kannada)

🤖 AI Chatbot Features

Bilingual Chatbot: Kannada + English

Intent detection (greeting, search, booking, price inquiry, help, etc.)

Auto language detection

Real-time translation

Provides suggestions and step-by-step help

Integrated with Spring Boot via REST API

🏗️ Tech Stack
🔹 Frontend

React.js

Material UI

Axios

🔹 Backend

Java 17

Spring Boot 3.3.5

Spring Data JPA

MySQL 8.0

SendGrid (email service)

🔹 AI/ML Service

Python Flask

NLTK

TensorFlow (optional)

Custom English–Kannada translation module

Rule-based + ML-based intent detection

🔹 Deployment

Docker & Docker Compose

📌 System Architecture
Frontend (React.js)
      ↓
Spring Boot API (Java Backend)
      ↓
ML Service (Python Flask)
      ↓
MySQL Database

📂 Project Modules
1️⃣ Frontend (React.js)

User login & registration

Equipment search/filter

Booking UI

Chatbot widget

Fully responsive design

2️⃣ Backend (Spring Boot)

Modules include:

AuthenticationController

EquipmentController

BookingController

MLController

EmailService (SendGrid)

UserController

3️⃣ Machine Learning Service (Python Flask)

Chatbot API

Language detection

Translation EN ↔ KN

Intent classification (greeting, search, booking, help, pricing, thanks, etc.)

Message suggestions

🗄️ Database Schema (MySQL)
Users
user_id, email, password_hash, phone, location, user_type, created_at

Equipment
equipment_id, owner_id, name, type, daily_rate, location, availability_status

Bookings
booking_id, renter_id, equipment_id, start_date, end_date, status, total_cost

ChatMessages
message_id, user_id, message_text, language, intent, session_id

💬 API Endpoints (Important)
Chatbot

POST /api/ml/chatbot/chat
Request:

{
  "message": "I need a tractor",
  "language": "en"
}

Translation

POST /api/ml/chatbot/translate

Language Detection

POST /api/ml/chatbot/detect-language

🧠 AI Intent Classification

Supported intents:

Intent	Example
greeting	hello, namaste
equipment_search	need tractor, search sprayer
rental_process	how to rent
pricing	cost, price details
booking_status	check my booking
help	support, help me
equipment_types	types of machines
thanks	thank you
🧹 How to Run the Project
🔧 Backend (Spring Boot)
cd backend
mvn clean install
mvn spring-boot:run

🔧 ML Service (Flask)
cd ml-service
pip install -r requirements.txt
python app.py

🔧 Frontend (React)
cd frontend
npm install
npm start

🧩 Future Enhancements

Mobile App (Android/iOS)

Payment gateway integration

Multi-language expansion (Tamil, Telugu, Marathi)

IoT integration for equipment tracking

AI-based recommendation system

🧑‍💻 Author

Gopi Gowda
📧 Email: gopigowda132@gmail.com

🌍 Location: Karnataka, India





![WhatsApp Image 2025-11-16 at 20 44 48_0d50debe](https://github.com/user-attachments/assets/3b1c34a9-9ace-41cd-b2f5-1823d8b4036c)


<img width="1600" height="900" alt="Screenshot 2025-11-16 223641" src="https://github.com/user-attachments/assets/bab898ff-f5d9-4a27-86d1-41d364df8e82" />


![WhatsApp Image 2025-11-16 at 20 34 38_a2c08e94](https://github.com/user-attachments/assets/5dc9c432-f037-4f81-9788-7c4d9c299587)



![WhatsApp Image 2025-11-16 at 20 35 20_b668ddb7](https://github.com/user-attachments/assets/9d5986d0-ae8f-4dce-8b78-2ae79cbac4d0)



![WhatsApp Image 2025-11-16 at 20 35 45_67546845](https://github.com/user-attachments/assets/0b40c401-cea3-42d0-a0ec-1921a5368c31)



![WhatsApp Image 2025-11-16 at 20 39 40_d1900521](https://github.com/user-attachments/assets/62d62f1e-4948-4620-8a24-706e56e550e8)


![WhatsApp Image 2025-11-16 at 20 39 53_059114ef](https://github.com/user-attachments/assets/7c535d1f-0116-44f8-8b09-ee25798d3577)


![WhatsApp Image 2025-11-16 at 20 40 29_35383411](https://github.com/user-attachments/assets/8020c0b9-86c2-42b7-bff7-a81e3231cb20)



![WhatsApp Image 2025-11-16 at 20 47 30_3b0f0656](https://github.com/user-attachments/assets/f0e08df7-0579-4f6d-8481-848d75f4646f)




