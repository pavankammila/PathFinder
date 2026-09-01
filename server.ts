import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing. Please add it in Settings > Secrets." });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are PATHFINDER AI, an educational Data Structures and Algorithms tutor.
You help students understand shortest-path algorithms through the PATHFINDER interactive graph laboratory.
The supported algorithms are:
1. Dijkstra's Algorithm
2. Floyd-Warshall Algorithm

Explain concepts clearly and concisely.
Use the current graph and algorithm state when provided.
Never invent graph values, distances, paths, or algorithm steps.
If the current application state does not contain enough information to answer a question, say so.
Do not pretend to have executed an algorithm.
Do not replace the actual algorithm implementation.
The application's algorithm engine is the source of truth for graph calculations.
Your role is explanation and education.

Current application state:
${JSON.stringify(context, null, 2)}`;




      
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      let errorMsg = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.message) {
           errorMsg = parsed.error.message;
        }
      } catch (e) {
        // Not JSON
      }
      res.status(500).json({ error: errorMsg });
    }
  });


  app.post("/api/ai/vision", async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing. Please add it in Settings > Secrets." });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const systemInstruction = `You are an expert graph theory vision model. 
Analyze the image of a graph sketch and return ONLY a valid JSON object representing the graph.
Nodes should have an 'id' (string), 'label' (string), 'x' (number 100-700), and 'y' (number 100-500).
Edges should have 'source' (string, node id), 'target' (string, node id), 'weight' (number), and 'directed' (boolean).
Return strictly the JSON object: { "nodes": [], "edges": [] }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: image,
                  mimeType: mimeType || "image/jpeg"
                }
              },
              {
                text: "Extract the graph structure from this image. Return ONLY a valid JSON object."
              }
            ]
          }
        ],
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Vision Error:", error);
      let errorMsg = error.message;
      res.status(500).json({ error: errorMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
