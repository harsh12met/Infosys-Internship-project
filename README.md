# ProjectFlow - Task & Team Collaboration Platform 🚀

A full-stack Kanban task management application with drag-and-drop functionality, built with Angular and Node.js.

![ProjectFlow](https://img.shields.io/badge/Status-Active-success)
![Angular](https://img.shields.io/badge/Angular-19-red)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

---

## ✨ Features

- 📋 **Kanban Board** - Visual task management with drag-and-drop
- 👥 **Team Collaboration** - Group leaders can manage team members
- 💬 **Real-time Comments** - Add comments and collaborate on tasks
- 🔔 **Notifications** - Stay updated with task assignments and comments
- 🎨 **Modern UI** - Clean, responsive design with smooth animations
- 🔐 **Secure Authentication** - JWT-based auth with role-based access
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile

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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions on Netlify and Render.

### Quick Deploy

**Frontend (Netlify):**

- Automatically configured via `netlify.toml`
- Just connect your GitHub repo to Netlify

**Backend (Render):**

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

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

1. **Individual User**

   - Create personal boards and tasks
   - Manage own tasks and columns

2. **Group Leader**

   - Invite members to the team
   - Clear entire board
   - Manage team tasks

3. **Group Member**
   - View and manage assigned tasks
   - Add comments and collaborate

### Core Workflows

1. **Sign Up / Login**

   - Register as individual or group leader
   - Login to access your board

2. **Create Columns**

   - Add custom columns (e.g., "To Do", "In Progress", "Done")
   - Reorder columns via drag-and-drop

3. **Manage Tasks**

   - Create tasks with title and description
   - Drag tasks between columns
   - Add priority and due dates
   - Delete or edit tasks

4. **Collaborate**
   - Add comments to tasks
   - Receive notifications for updates
   - Invite team members (Group Leaders only)

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
  apiUrl: "http://localhost:3000/api",
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
