# Kanban Task Manager - Backend

Backend API for the Kanban Task Manager application.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file:

   ```bash
   copy .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/columns` - Get all columns
- `POST /api/columns` - Create column

Server runs on http://localhost:3000
