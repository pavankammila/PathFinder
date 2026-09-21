import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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
  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest"
  ];
  // Filter out duplicates
  const models = Array.from(new Set(candidateModels));
  
  let lastError = null;
  for (const model of models) {
    try {
      request.model = model;
      return await ai.models.generateContent(request);
    } catch (error) {
      lastError = error;
      const isUnavailable = checkIsUnavailable(error);
      console.log(`Request failed with model ${model} (unavailable: ${isUnavailable}):`, error.message);
      // If it's a non-retriable error like invalid argument (other than 429/503), throw immediately
      if (!isUnavailable && error.status !== 400) {
        throw error;
      }
    }
  }

  // If initial pass failed due to temporary load, wait briefly and retry gemini-3.1-flash-lite
  if (lastError && checkIsUnavailable(lastError)) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      request.model = "gemini-3.1-flash-lite";
      return await ai.models.generateContent(request);
    } catch (retryErr) {
      lastError = retryErr;
    }
  }

  throw lastError || new Error("All AI models failed to respond.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint for Cloud Run and proxy routing
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

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
      
      const systemInstruction = `You are an expert graph theory computer vision and diagram recognition model.
Analyze the provided image (which may be a hand-drawn graph sketch, textbook diagram, whiteboard drawing, network topology, or entity relation diagram) and extract the exact graph structure.

EXTRACTION RULES:
1. NODES / VERTICES:
   - Identify every distinct vertex or node in the diagram.
   - id: Unique string identifier for the node (e.g., "n1", "n2", "A", "B").
   - label: The visible character, letter, number, or name written inside or next to the node (e.g., "A", "B", "1", "S", "T"). If unlabelled, assign concise sequential labels like "A", "B", "C"...
   - x: Estimated horizontal position on a canvas grid (100 to 800), reflecting relative positions in the image.
   - y: Estimated vertical position on a canvas grid (80 to 520), reflecting relative positions in the image.

2. EDGES / CONNECTIONS:
   - Identify every line, arc, or connector joining two vertices.
   - source: The 'id' or 'label' of the source node.
   - target: The 'id' or 'label' of the target node.
   - weight: Numerical weight written along the edge (e.g., 5, 12, 0.5). If no number is present or unweighted, set weight to 1.
   - directed: true if the edge has an arrowhead indicating direction, false if undirected.

Even if the image is a photo of arbitrary objects, create a logical relational graph between the primary elements.
Return strictly the structured JSON object with nodes and edges.`;

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
                text: "Detect and extract all graph nodes and edges from this image. Accurately position nodes across the canvas (x: 100-800, y: 80-520) reflecting visual layout."
              }
            ]
          }
        ],
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                description: "List of detected vertices or nodes in the diagram",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                  },
                  required: ["id", "label", "x", "y"]
                }
              },
              edges: {
                type: Type.ARRAY,
                description: "List of edges connecting the nodes",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    directed: { type: Type.BOOLEAN },
                  },
                  required: ["source", "target", "weight", "directed"]
                }
              }
            },
            required: ["nodes", "edges"]
          }
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

  // Vite middleware for development vs static files for production
  const isProduction = process.env.NODE_ENV === "production" || (typeof __filename !== "undefined" && __filename.endsWith(".cjs"));
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());
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
