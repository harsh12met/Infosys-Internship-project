const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const distPath = path.join(__dirname, 'dist', 'my-kanban-project', 'browser');

console.log('📂 Serving from:', distPath);

// Serve static files
app.use(express.static(distPath));

// SPA fallback - all routes serve index.html
app.get('*', (req, res) => {
  console.log('📄 Request:', req.url);
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
});
