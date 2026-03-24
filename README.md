# Medical History Portal

A web-based application designed to securely manage and share patient medical records. The platform features a dual-role system (Patients and Doctors) where patients maintain control over who accesses their medical history through a secure, time-sensitive One-Time Password (OTP) authorization system.

## Features

### 🧑‍⚕️ For Doctors
- **Registration & Verification:** Secure sign-up using Medical License Number and Specialty.
- **OTP Verification:** Access patient records securely by entering a 6-digit OTP provided by the patient.
- **Manage Records:** View complete medical histories of authorized patients and seamlessly add new medical records (Disease details and Prescriptions).

### 🤒 For Patients
- **Profile Management:** Register and view personal details including Date of Birth, Contact Number, and Blood Group.
- **Access Control (OTP):** Generate a temporary, 15-minute 6-digit access code to share with a doctor for temporary access to medical records.
- **View History:** Browse personal medical history and previous prescriptions.

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose for object modeling)

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed [Node.js](https://nodejs.org/)
- You have installed and are running [MongoDB](https://www.mongodb.com/try/download/community) locally on the default port (`27017`).

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Medical_History
   ```

2. **Install dependencies:**
   Make sure you are in the root directory and run:
   ```bash
   npm install
   ```
   *(This will install required packages like `express` and `mongoose`)*

3. **Start the MongoDB Server:**
   Ensure your local MongoDB instance is running. By default, the application connects to `mongodb://127.0.0.1:27017/medical_history`.

4. **Start the Application:**
   Run the Node.js server:
   ```bash
   node Server.js
   ```

5. **Access the Web App:**
   Open your web browser and navigate to:
   `http://localhost:3000`

## Project Structure

```text
Medical_History/
│
├── DB/                     # Mongoose Database Models
│   ├── Doctor.js           # Doctor schema definition
│   ├── Patient.js          # Patient schema definition
│   └── MedicalRecord.js    # Medical Record schema definition
│
├── Public/                 # Frontend Static Files
│   ├── dashboard.html      # Main dashboard (handles both Patient and Doctor views)
│   ├── login.html          # Login page
│   ├── signin.html         # Registration page
│   └── style.css           # Global stylesheet
│
├── src/                    # Source assets (e.g., logo.png)
│
└── Server.js               # Main Express.js backend server application
```

## License

This project is open-source and available under the MIT License.