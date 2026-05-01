# ⚒️ CodeForge

![CodeForge Banner](https://img.shields.io/badge/CodeForge-Premium_Git_Management-f85149?style=for-the-badge&logo=github&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Success-3fb950?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-d29922?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-MERN_Stack-blue?style=for-the-badge)

CodeForge is a next-generation, premium Git repository management platform designed for developers who value aesthetics as much as performance. Featuring a stunning **Red-Yellow-Green** design system, CodeForge provides a seamless experience for managing source code, tracking issues, and visualizing developer activity.

---

## 📸 Project Showcases

### 🏠 Developer Dashboard
The central hub for all your development activity. Features a three-column layout with suggested repositories, your active projects, and a global community feed.
![Dashboard](docs/screenshots/dashboard.png)

### 👤 Professional Profile
A personalized developer portfolio including a bio, social links, pinned repositories, and a contribution heatmap.
![Profile](docs/screenshots/profile.png)

### 📂 Repository Management
A deep-dive view into your projects with mock Git cloning, language distribution bars, and detailed sidebar statistics.
![Repo Detail](docs/screenshots/repo_detail.png)

### 🎫 Issue Tracking
Collaborate efficiently with integrated issue tracking. Create, view, and manage project roadblocks with ease.
![Issues](docs/screenshots/issues.png)

### 🌍 Global Explore Section
Discover trending projects and community activity at a glance.
![Explore](docs/screenshots/explore.png)

---

## 🚀 Core Features

- **💎 Premium Design System**: Custom-built UI using a vibrant Red-Yellow-Green mixture palette with glassmorphism and advanced micro-animations.
- **📊 Activity Heatmap**: Visualize contribution history using an integrated heatmap component.
- **📁 Smart Repository Management**: Create public or private repositories with automated description and visibility handling.
- **🛠️ Integrated Issue Tracker**: Full CRUD functionality for project issues to maintain high-velocity development.
- **👤 Advanced User Profiles**: Personalize your presence with bios, location tracking, and pinned repository highlights.
- **🔍 Community Feed**: Stay updated with global activity, including stars and pushes from other developers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Axios, React Router, UIW HeatMap |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Styling** | Vanilla CSS (Custom Variable Design System) |
| **Auth** | JWT (JSON Web Tokens) |

---

## ⚙️ Environment Requirements

To run this project locally, ensure you have the following environment variables configured in your `backend-main/.env` file:

```env
PORT=3002
MONGODB_URI=mongodb://127.0.0.1:27017/codeforge
JWT_SECRET_KEY=your_super_secret_key_here
```

---

## 🏃 Run Method

Follow these steps to get the production-level development environment running:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CodeForge.git
cd CodeForge
```

### 2. Start the Backend Server
```bash
cd backend-main
npm install
npm start
```
*The backend will be live at `http://localhost:3002`*

### 3. Start the Frontend Server
```bash
cd frontend-main
npm install
npm run dev
```
*The frontend will be live at `http://localhost:5173` (or the next available port)*

---

## 📁 Directory Structure

```text
CodeForge/
├── backend-main/         # Express API Server
│   ├── controllers/      # Business Logic
│   ├── models/           # Mongoose Schemas
│   ├── routes/           # API Endpoints
│   └── index.js          # Entry Point
├── frontend-main/        # React Application
│   ├── src/
│   │   ├── components/   # Modular UI Components
│   │   ├── assets/       # Static Media
│   │   └── index.css     # Global Design System
├── docs/
│   └── screenshots/      # README Assets
└── README.md             # Project Documentation
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Developed with ❤️ by **CodeForge Team**
