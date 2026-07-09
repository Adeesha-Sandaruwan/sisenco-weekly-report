<img width="1920" height="4159" alt="Untitled design (4)" src="https://github.com/user-attachments/assets/3f3ba72f-e0e3-451e-93dc-ae7c4575b7a0" />

<div align="center">

# ✨ Sisenco Core

**Premium Team Analytics & Weekly Reporting Platform**

A cinematic, zero-latency dashboard engineered for elite engineering managers. Powered by a decoupled architecture, Optimistic UI state management, and an integrated Retrieval-Augmented Generation (RAG) AI core.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

</div>

<hr />

## 🚀 Quick Start Guide

Follow these simple steps to get Sisenco Core running on your local machine in under 3 minutes.

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v16 or higher)
* [PostgreSQL](https://www.postgresql.org/) (Running locally or via a cloud provider like Supabase)
* Git

## Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/Adeesha-Sandaruwan/sisenco-weekly-report.git
cd sisenco-weekly-report
```

### 1️⃣ Database Configuration

First, we need to connect the application to your PostgreSQL database and set up your environment keys.

Create a `.env` file inside the `backend` folder and add your connection strings:

```env
# backend/.env
DATABASE_URL="postgresql://postgres.[Project_ID]:[Your password]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="generate_a_secure_random_string_here"
GEMINI_API_KEY="your_google_gemini_api_key_here" # Required for Sisenco AI chat assistant
```

Next, open your terminal, navigate to the backend, and push the database schema:

```bash
cd backend
npx prisma db push
```

> **Note:** This command automatically generates all required SQL tables, relationships, and foreign keys based on the Prisma schema.

### 2️⃣ Installing Dependencies

You will need to install the required packages for both the Frontend and Backend environments.

**For the Backend:**

```bash
cd backend
npm install
```

**For the Frontend:**

Open a new terminal window/tab:

```bash
cd frontend
npm install
```

### 3️⃣ Running the Backend Server

In your backend terminal, start the Node.js/Express server:

```bash
# Make sure you are in the /backend folder
npx nodemon server.js
```

You should see a success message: `Server running on port 5000`

### 4️⃣ Running the Frontend UI

In your frontend terminal, start the Vite development server:

```bash
# Make sure you are in the /frontend folder
npm run dev
```

Click the local link provided in the terminal (usually `http://localhost:5173`) to open login screen in your browser.


In your frontend terminal, start the Vite development server:

```bash
# Use these Demo credentials to quick sign-in
Manager

Email: manager@sisenco.com
Password: password123

Team_Member

Email: member@sisenco.com
Password: password123

```

## 🌟 System Architecture & Highlights

| Feature | Description |
|---|---|
| **Optimistic UI** | Forms and grids update instantly with zero database latency for a frictionless experience. |
| **Cinematic RAG AI** | Sisenco Core uses Google Gemini 2.5 Flash injected with live team data to answer management queries. |
| **Data Visualization** | Real-time Area, Donut, and Stacked Bar charts powered by Recharts. |
| **Role-Based Security** | Strict JWT authentication dividing Member workspaces from Manager analytical panels. |
