# ProjectFlow - Deployment Guide

## 📦 Deployment Overview

This project uses:
- **Frontend (Angular)**: Deployed on Netlify
- **Backend (Node.js/Express)**: Deployed on Render
- **Database**: MongoDB Atlas

---

## 🚀 Frontend Deployment (Netlify)

### Prerequisites
1. Create a [Netlify](https://www.netlify.com/) account
2. Connect your GitHub repository

### Steps

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy on Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and select your repository
   - **Build settings are auto-configured via `netlify.toml`**:
     - Base directory: `frontend`
     - Build command: `npm install && npm run build`
     - Publish directory: `frontend/dist/my-kanban-project/browser`

3. **Environment Variables (Optional):**
   - Go to Site settings → Environment variables
   - Add any frontend-specific variables if needed

4. **Update Backend URL:**
   - After deploying backend, update `frontend/src/environments/environment.prod.ts`
   - Replace `your-backend-url.onrender.com` with actual Render URL

---

## 🔧 Backend Deployment (Render)

### Prerequisites
1. Create a [Render](https://render.com/) account
2. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database

### Steps

1. **Create MongoDB Atlas Database:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Get your connection string (replace `<password>` with your password)
   - Whitelist IP: `0.0.0.0/0` (Allow from anywhere)

2. **Deploy on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `projectflow-backend` (or your choice)
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: `Free`

3. **Add Environment Variables:**
   Click "Environment" and add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kanban?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-url.netlify.app
   ```

4. **Get Backend URL:**
   - After deployment, copy the Render URL (e.g., `https://projectflow-backend.onrender.com`)
   - Update frontend `environment.prod.ts` with this URL

---

## 🔄 Update Frontend with Backend URL

1. **Edit `frontend/src/environments/environment.prod.ts`:**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.onrender.com/api',
   };
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push origin main
   ```

3. **Netlify will auto-deploy** the updated frontend

---

## 🔐 CORS Configuration

The backend is already configured to accept requests from your frontend. Make sure the `FRONTEND_URL` environment variable in Render matches your Netlify URL.

---

## 📝 Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and connection string copied
- [ ] Backend deployed on Render with environment variables
- [ ] Frontend environment.prod.ts updated with Render backend URL
- [ ] Frontend deployed on Netlify
- [ ] Test login/signup functionality
- [ ] Test board creation and task management
- [ ] Check browser console for any CORS errors

---

## 🐛 Troubleshooting

### Frontend Build Fails
- Check `netlify.toml` configuration
- Ensure Node version is 18 or higher
- Check build logs on Netlify

### Backend Connection Issues
- Verify MongoDB connection string in Render environment variables
- Check if MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Review Render logs for errors

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your Netlify URL exactly
- Check if frontend is using HTTPS (Netlify provides this automatically)

### Database Connection Fails
- Verify MongoDB Atlas cluster is running
- Check username/password in connection string
- Ensure network access allows connections from anywhere

---

## 🌐 Live URLs

After deployment, your URLs will be:
- **Frontend**: `https://your-project.netlify.app`
- **Backend**: `https://your-backend.onrender.com`

---

## 📊 Monitoring

- **Netlify**: Check deploy logs and analytics in dashboard
- **Render**: Monitor service logs and metrics
- **MongoDB Atlas**: Check database metrics and connections

---

## 🔄 Continuous Deployment

Both Netlify and Render are configured for automatic deployment:
- Push to `main` branch → Automatic deployment on both platforms
- Build logs available in respective dashboards

---

## 💡 Tips

1. **Free Tier Limitations:**
   - Render free tier: Service spins down after 15 min of inactivity (first request may be slow)
   - MongoDB Atlas free tier: 512MB storage
   - Netlify free tier: 100GB bandwidth/month

2. **Keep Secrets Safe:**
   - Never commit `.env` files to Git
   - Use environment variables for sensitive data
   - Rotate JWT secrets periodically

3. **Performance:**
   - Enable caching headers in Netlify
   - Use MongoDB indexes for better query performance
   - Monitor Render service logs for slow queries
