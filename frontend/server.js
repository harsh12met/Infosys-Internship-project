const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4201;

// Serve static files from the Angular build
app.use(express.static(path.join(__dirname, 'dist/my-kanban-project/browser')));

// All routes redirect to index.html for Angular routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/my-kanban-project/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend server running on port ${PORT}`);
});
