# CodeForge
A MERN‑stack web application offering GitHub‑like version control with a custom-built system for managing repositories and commits.

🔥 Features
User Authentication: Secure signup/login with JWT-based sessions.

Repository Management: Create, edit, delete repos; view repository contents.

Version Control: Commit changes, view history and diffs, rollback to previous versions.

File Operations: Add, update, delete files within repos; basic syntax highlighting in editor.

Collaboration: Share repositories with other users via invite links.

Dashboard: Overview of your projects, activity, and recent commits.

RESTful API: Backend endpoints for users, repos, commits, and file operations.

Real-time Updates: (Optional) WebSockets to notify users of new commits, invites, etc.

Frontend Interface: React-based client interface with clean UX.

🛠️ Tech Stack
Layer	Technology
🧑‍💻 Frontend	: React, React Router, Context API/hooks, Axios
🔧 Backend :	Node.js, Express, WebSocket (optional), JWT Auth
🗄️ Database	: MongoDB (Mongoose ODM)
🛡️ Auth	: JWT, bcrypt
🧪 Editor	: CodeMirror or Monaco editor for file editing
📦 Deployment	: Render.com

🚧 Setup & Development
Prerequisites
Node.js v16+

npm or yarn

MongoDB connection string

CodeForge account (for deployment)

Installation
bash
Copy
Edit
git clone https://github.com/AYUSHSAINI9876/CodeForge.git
cd CodeForge

# Backend
cd backend
npm install

# Frontend in another terminal
cd ../frontend
npm install

Local Development
bash
Copy
Edit
# Backend
cd backend && npm run dev  # using nodemon

# Frontend
cd ../frontend && npm start
Access the app at http://localhost:3000.

📦 Deployment on Render
Backend
Push to GitHub.

Create New Web Service on Render.

Choose Node environment, repo, and set:

Root Directory: backend/

Build: npm install

Start: npm start

Add env vars (PORT, MONGO_URI, JWT_SECRET).

Deploy → you'll get a URL like https://codeforge-backend.onrender.com.

Frontend
Create another Web Service on Render.

Configure:

Root Directory: frontend/

Build: npm install && npm run build

Start: npx serve -s build

Env var REACT_APP_API_URL pointing to backend URL.

Deploy → static site at something like https://codeforge-frontend.onrender.com.

Optional: Database
MongoDB Atlas is recommended for free, reliable hosting.
