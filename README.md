# 🎓 EduAdvisor AI

> **Student Information Analyzer & Personalized Academic Advisor**

EduAdvisor AI is an AI-powered academic assistance platform that analyzes student performance and provides personalized learning recommendations. It enables teachers to manage student records, visualize academic performance through interactive dashboards, and generate AI-driven insights to help students improve their learning outcomes.

---

## 📖 Overview

Educational institutions generate large amounts of student data, but it is often used only for record-keeping. **EduAdvisor AI** transforms this data into meaningful insights using Artificial Intelligence.

The platform allows teachers to manually enter student records or upload them through CSV files. It analyzes academic performance and generates personalized study plans, subject-wise recommendations, and downloadable PDF reports using the **Google Gemini API**.

---

## ✨ Features

- 🔐 Secure User Authentication (JWT & bcrypt)
- 👨‍🏫 Teacher Dashboard
- 👨‍🎓 Student Dashboard
- 👨‍👩‍👦 Parent Dashboard
- 📊 Interactive Performance Dashboard
- 🤖 AI-Powered Academic Recommendations
- 📁 CSV File Upload
- 📄 PDF Report Generation
- 🌐 Multilingual Support
- 📈 Academic Performance Analytics
- 📧 Email Notifications (Nodemailer)
- 📱 Responsive User Interface

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js

### Authentication
-Firebase

### AI Integration
- Google Gemini API

### Other Libraries
- Nodemailer
- CSV Parser
- PDF Generation Library

### Development Tools
- Git
- GitHub
- Visual Studio Code

---


## 🔑 Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=3000

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_app_password
```

---
## 🚀 Running the Project

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/EduAdvisor-AI.git
cd EduAdvisor-AI
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Start the Backend Server

```bash
node server.js
```

### 4. Run the Frontend

Open the project using the **Live Server** extension in Visual Studio Code.

The frontend will be available at:

```
http://localhost:5500
```

> **Note:** Ensure the backend server is running before using the frontend so that API requests work correctly.

## 🚀 Workflow

1. Teacher logs into the system.
2. Student records are entered manually or uploaded using CSV.
3. Academic data is stored in MongoDB.
4. Performance analytics are generated.
5. AI analyzes the student's academic profile.
6. Personalized recommendations are displayed.
7. PDF reports are generated.
8. Students and parents can view dashboards and reports.

---

## 📊 System Modules

- User Authentication
- Student Management
- CSV Upload
- Dashboard Analytics
- AI Recommendation Engine
- PDF Report Generation
- Parent Portal
- Multilingual Support

---

## 🎯 Future Scope

- Mobile Application
- Learning Management System (LMS) Integration
- Predictive Analytics
- AI Voice Assistant
- Face Recognition Attendance
- Cloud Deployment
- Advanced Machine Learning Models

---

## 🤝 Contributors

- **Mohit**
- **Swastik Samir**
- **Satyam Rana**

---

## 📄 License

This project is developed for academic and educational purposes under the **IDEA Lab Project** at **USICT, Guru Gobind Singh Indraprastha University**.

---

## ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

---

## 📬 Contact

For suggestions or collaboration:


