# ProjectFlow - Task & Team Collaboration Platform 🚀

A full-stack Kanban task management application with drag-and-drop functionality, built with Angular and Node.js.

![ProjectFlow](https://img.shields.io/badge/Status-Active-success)
![Angular](https://img.shields.io/badge/Angular-19-red)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

## 🌐 Live Demo

**Frontend:** [https://infosysproject-rudx.onrender.com](https://infosysproject-rudx.onrender.com)

**Backend API:** [https://infosys-internship-project-backend.onrender.com](https://infosys-internship-project-backend.onrender.com)

---

## ✨ Features

- 📋 **Kanban Board** - Visual task management with drag-and-drop
- 👥 **Team Collaboration** - Group leaders can manage team members
- 💬 **Real-time Comments** - Add comments and collaborate on tasks
- 🔔 **Notifications** - Stay updated with task assignments and comments
- 🎯 **Task Assignment** - Leaders can assign tasks to team members
- 🔒 **Role-Based Access** - Different permissions for leaders and members
- 🎨 **Modern UI** - Clean, responsive design with smooth animations
- 🔐 **Secure Authentication** - JWT-based auth with role management
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- 🔍 **Task Search** - Quickly find tasks across columns
- ⚡ **Real-time Updates** - Instant synchronization across devices

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Angular 19
- **Styling**: Custom CSS with modern gradients
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **State Management**: Services with RxJS

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, CORS
- **Validation**: express-validator

---

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Clone Repository

```bash
git clone https://github.com/harsh12met/Infosys-Internship-project.git
cd Infosys-Internship-project
```

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# MONGODB_URI=mongodb://localhost:27017/kanban
# JWT_SECRET=your-secret-key
# PORT=3000

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:4201`

---

## 🚀 Deployment

The application is deployed and live at:

- **Frontend (Render):** [https://infosysproject-rudx.onrender.com](https://infosysproject-rudx.onrender.com)
- **Backend API (Render):** [https://infosys-internship-project-backend.onrender.com](https://infosys-internship-project-backend.onrender.com)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Deploy Your Own Instance

**Frontend (Render/Netlify):**
- Connect GitHub repository
- Build Command: `npm install && npm run build`
- Publish Directory: `dist/frontend/browser`

**Backend (Render):**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables (MONGODB_URI, JWT_SECRET)

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── board/      # Kanban board component
│   │   │   ├── column/     # Column component
│   │   │   ├── task/       # Task card component
│   │   │   ├── services/   # API services
│   │   │   └── guards/     # Route guards
│   │   └── environments/   # Environment configs
│   └── package.json
│
├── netlify.toml            # Netlify configuration
├── DEPLOYMENT.md           # Deployment guide
└── README.md
```

---

## 🎯 Usage

### User Roles

1. **Single User**
   - Create and manage personal boards
   - Full control over own tasks and columns
   - Independent task management

2. **Group Leader**
   - Create teams with access keys
   - Invite and manage team members
   - Assign tasks to members
   - Manage columns and board settings
   - Receive notifications for member comments

3. **Group Member**
   - Join team using access key
   - View all team tasks (read-only)
   - Comment on assigned tasks
   - Cannot create, edit, or delete tasks
   - Cannot manage columns

### Core Workflows

1. **Sign Up / Login**
   - Choose user type: Single or Group
   - Group leaders get unique access key
   - Members join using leader's access key

2. **Team Management** (Leaders Only)
   - Share access key with team members
   - View all team members
   - Assign tasks to specific members

3. **Task Management**
   - Leaders/Single users: Create, edit, delete tasks
   - Set priority levels (Low, Medium, High)
   - Add due dates
   - Assign to team members (leaders only)
   - Members: View-only access to all tasks

4. **Kanban Board**
   - Default columns: To Do, In Progress, Done
   - Leaders/Single users can add custom columns
   - Drag and drop tasks between columns
   - Reorder columns as needed

5. **Collaboration**
   - Comment on tasks
   - Members can comment on assigned tasks
   - Real-time notifications
   - Task activity tracking

---

## 🔧 Configuration

### Environment Variables

**Backend (`backend/.env`):**

```env
MONGODB_URI=mongodb://localhost:27017/kanban
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4201
```

**Frontend (`frontend/src/environments/environment.ts`):**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Production (`frontend/src/environments/environment.prod.ts`):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://infosys-internship-project-backend.onrender.com/api'
};
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
ng test
```

---

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Boards

- `GET /api/boards` - Get user's board
- `POST /api/boards` - Create board
- `DELETE /api/boards/:id/clear` - Clear board (Leaders only)

### Columns

- `POST /api/columns` - Create column
- `PUT /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments

- `GET /api/tasks/:taskId/comments` - Get task comments
- `POST /api/tasks/:taskId/comments` - Add comment

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Harshal Mali**
- GitHub: [@harsh12met](https://github.com/harsh12met)
- Email: harshalmali11204@gmail.com
- Project: [Infosys Internship Project](https://github.com/harsh12met/Infosys-Internship-project)

**Live Application:**
- Frontend: [https://infosysproject-rudx.onrender.com](https://infosysproject-rudx.onrender.com)
- Backend: [https://infosys-internship-project-backend.onrender.com](https://infosys-internship-project-backend.onrender.com)

---

## 🙏 Acknowledgments

- Infosys Internship Program
- Angular Team for the amazing framework
- MongoDB for the database platform
- All contributors and testers

---

## 📞 Support

If you have any questions or issues, please:

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Open an issue on GitHub
3. Contact: harshalmali11204@gmail.com

---

## 🎉 Show Your Support

Give a ⭐️ if you like this project!

---

**Made with ❤️ for better team collaboration**
