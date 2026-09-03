import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function checkIsUnavailable(error) {
  if (!error) return false;
  if (error.status === 503 || error.status === 429) return true;
  const msg = (error.message || "").toLowerCase();
  return msg.includes('503') || 
         msg.includes('429') ||
         msg.includes('unavailable') || 
         msg.includes('high demand') ||
         msg.includes('resource_exhausted') ||
         msg.includes('overloaded') ||
         msg.includes('temporarily');
}

async function executeWithRetry(ai, request) {
  let primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  let currentModel = primaryModel;
  const FALLBACK_MODEL = "gemini-flash-latest";
  const delays = [0, 2000, 5000, 10000];
  
  try {
    request.model = currentModel;
    return await ai.models.generateContent(request);
  } catch (error) {
    const isUnavailable = checkIsUnavailable(error);
    console.log(`Initial request failed with model ${currentModel}:`, error.message);
    if (!isUnavailable) throw error;
  }
  
  for (let i = 0; i < delays.length; i++) {
    const delay = delays[i];
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Switch to fallback model after initial attempt + first retry
    if (i >= 1 && currentModel === primaryModel) {
      console.log(`Switching to fallback model: ${FALLBACK_MODEL}`);
      currentModel = FALLBACK_MODEL;
    }
    
    try {
      request.model = currentModel;
      return await ai.models.generateContent(request);
    } catch (error) {
      const isUnavailable = checkIsUnavailable(error);
      console.log(`Retry attempt ${i + 1} failed with model ${currentModel}:`, error.message);
      
      if (i === delays.length - 1 || !isUnavailable) {
        throw error;
      }
    }
  }
  throw new Error("All retries failed");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 10000;
  
  app.use(express.json({ limit: '10mb' }));

  // AI endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request: messages array is required." });
      }

      
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

      const systemInstruction = `You are PATHFINDER AI, a professional, university-level Data Structures and Algorithms tutor.
You help students understand shortest-path algorithms through the PATHFINDER interactive graph laboratory.

The supported algorithms are:
1. Breadth-First Search (BFS)
2. Dijkstra's Algorithm
3. Bellman-Ford Algorithm
4. Floyd-Warshall Algorithm
5. DAG Shortest Path
6. A* (A-Star)
7. Johnson's Algorithm
8. Bidirectional Search
9. Dial's Algorithm
10. SPFA (Shortest Path Faster Algorithm)

Your primary role is explanation and education based strictly on the current application state and actual algorithms.

CRITICAL INSTRUCTIONS:
- NEVER use emojis (e.g., no ❌, ✅, 🔴, 🚀). Use clean, professional text like "Supported", "Not Supported", "Yes", "No".
- Use clean, academic Markdown formatting (short paragraphs, bullet points, bold terms, code blocks for pseudocode).
- When a user asks for a comparison, render a proper Markdown table.
- NEVER output raw LaTeX syntax (like \log, \cdot). Write math as readable plain text (e.g., O(V · E), O(V³), O((V + E) log V)).
- Analyze the actual provided graph, execution state, and comparison results to explain why nodes are selected, why edges are relaxed, or why validation failed. Do NOT invent data.
- If comparison data is provided, use it to analyze performance. Do not invent execution times.

Algorithm Knowledge to emphasize when relevant:
- BFS: unweighted, O(V + E)
- Dijkstra: non-negative weights, O((V + E) log V)
- Bellman-Ford: supports negative weights, detects cycles, O(V · E)
- Floyd-Warshall: all-pairs, dynamic programming, O(V³)
- DAG: requires acyclic graph, topological order, O(V + E)
- A*: heuristic-based (g(n) + h(n)), source-to-dest
- Johnson's: all-pairs, uses Bellman-Ford for reweighting then Dijkstra, does not handle negative cycles
- Bidirectional: simultaneous forward/backward search
- Dial's: non-negative integer weights, bucket-based, O(E + V·C)
- SPFA: queue-based Bellman-Ford improvement

Current application state:
${JSON.stringify(context, null, 2)}`;
      
      const contents = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const requestParams = {
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      };

      const response = await executeWithRetry(ai, requestParams);
      res.json({ text: response.text });

    } catch (error) {
      const isUnavailable = checkIsUnavailable(error);
      if (isUnavailable) {
        console.log("AI Chat Error (Unavailable):", error.message);
        return res.status(503).json({ error: "Gemini is temporarily busy. Please try again in a few seconds." });
      }
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
      
      if (!image) {
        return res.status(400).json({ error: "Invalid request: image data is required." });
      }

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
      
      const systemInstruction = `You are an expert graph theory vision model. Analyze the image of a graph sketch and return ONLY a valid JSON object representing the graph.
Nodes should have an 'id' (string), 'label' (string), 'x' (number 100-700), and 'y' (number 100-500).
Edges should have 'source' (string, node id), 'target' (string, node id), 'weight' (number), and 'directed' (boolean).
Return strictly the JSON object: { "nodes": [], "edges": [] }`;

      const requestParams = {
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
      };

      const response = await executeWithRetry(ai, requestParams);
      res.json({ text: response.text });

    } catch (error) {
      const isUnavailable = checkIsUnavailable(error);
      if (isUnavailable) {
        console.log("AI Vision Error (Unavailable):", error.message);
        return res.status(503).json({ error: "Gemini is temporarily busy. Please try again in a few seconds." });
      }
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
    const distPath = __dirname;
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
