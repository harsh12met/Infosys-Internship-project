const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4201;

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'frontend/dist/my-kanban-project/browser')));

// All routes should redirect to index.html for Angular to handle
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/my-kanban-project/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT}`);
});
