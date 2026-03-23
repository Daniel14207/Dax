import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import cors from 'cors';

const db = new Database('database.sqlite');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
  )
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors({
    origin: "*"
  }));
  app.use(express.json());

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ status: 'OK' });
  });

  // API Routes
  app.post('/api/auth/register', (req, res) => {
    const { phone, password } = req.body;
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const stmt = db.prepare('INSERT INTO users (id, phone, password, tokens, status) VALUES (?, ?, ?, ?, ?)');
      stmt.run(id, phone, password, 0, 'active');
      res.json({ id, phone, tokens: 0, status: 'active' });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Ce numéro est déjà utilisé' });
      } else {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE phone = ? AND password = ?');
    const user = stmt.get(phone, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Numéro ou mot de passe incorrect' });
    }
  });

  app.get('/api/users', (req, res) => {
    const stmt = db.prepare('SELECT id, phone, tokens, status FROM users');
    const users = stmt.all();
    res.json(users);
  });

  app.post('/api/users/:id/tokens', (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const stmt = db.prepare('UPDATE users SET tokens = tokens + ? WHERE id = ?');
    const info = stmt.run(amount, id);
    if (info.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.post('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?');
    const info = stmt.run(status, id);
    if (info.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
