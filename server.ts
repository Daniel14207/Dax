import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import cors from 'cors';

import { GoogleGenAI, Type } from '@google/genai';

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
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(cors({
    origin: "*"
  }));
  app.use(express.json({ limit: '50mb' }));

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

  app.post('/api/analyze-image', async (req, res) => {
    try {
      const { images } = req.body; // Array of base64 strings
      if (!images || images.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts = images.map((img: string) => {
        // img is expected to be "data:image/jpeg;base64,..."
        const mimeType = img.split(';')[0].split(':')[1];
        const data = img.split(',')[1];
        return {
          inlineData: {
            data,
            mimeType,
          }
        };
      });

      parts.push({
        text: `OBJECTIF :
- Générer l’analyse exacte du match depuis la capture d'écran fournie.
- Le Resultat (score final) doit toujours rester fixe, quel que soit le nombre de clics sur ANALYSE.
- Les matchs et cotes affichés doivent correspondre exactement à la capture d'écran.
- Tous les détails de l'analyse doivent correspondre au match et à la cote de la capture.

⚠️ RÈGLE ABSOLUE:
- L’IA doit travailler UNIQUEMENT avec les données de l’image uploadée.
- Ne jamais inventer de matchs, d'équipes ou de cotes.
- Si l'image ne contient pas de matchs de football ou de paris sportifs, retourner un tableau vide [].

INSTRUCTIONS :
1. Identifier le match, les équipes et la cote à partir de la capture.
2. Extraire exactement les informations : score, cote, date/heure si visible.
3. Générer une analyse complète incluant :
   - Équipe favorite et outsider
   - Probabilité du résultat
   - Score probable cohérent avec le Resultat fixe
   - Détails précis basés sur le match réel et la cote exacte
4. Fixer le Resultat pour qu'il ne change jamais.
5. La sortie doit correspondre exactement au match de la capture.

OUTPUT STRUCTURE :
Return a JSON array of objects, where each object represents a match found in the images, matching this structure:
{
  "match": "<nom complet du match exact>",
  "score": "<Resultat fixe exact>",
  "cote": "<cote exacte de la capture>",
  "analyse": {
      "favori": "<équipe favorite>",
      "outsider": "<équipe outsider>",
      "probabilité_resultat": "<%>",
      "score_probable": "<score cohérent>",
      "details": "<détails précis basés sur le match et la cote>"
  }
}`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: { parts },
        config: {
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                match: { type: Type.STRING },
                score: { type: Type.STRING },
                cote: { type: Type.STRING },
                analyse: {
                  type: Type.OBJECT,
                  properties: {
                    favori: { type: Type.STRING },
                    outsider: { type: Type.STRING },
                    probabilité_resultat: { type: Type.STRING },
                    score_probable: { type: Type.STRING },
                    details: { type: Type.STRING }
                  },
                  required: ["favori", "outsider", "probabilité_resultat", "score_probable", "details"]
                }
              },
              required: ["match", "score", "cote", "analyse"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini");
      }
      
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ error: 'Failed to analyze image' });
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
