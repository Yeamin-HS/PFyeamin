import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

// Configuration
const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let engine: MLCEngine | null = null;
let knowledgeChunks: string[] = [];
let chunkEmbeddings: number[][] = []; // Placeholder for embeddings if we had a real model

// 1. Initialize Model
export const initModel = async (onProgress: (text: string) => void) => {
    if (engine) return;

    onProgress("Loading AI Model (Llama 3.2 1B)...");

    engine = await CreateMLCEngine(
        SELECTED_MODEL,
        {
            initProgressCallback: (report) => {
                onProgress(report.text);
            },
        }
    );

    onProgress("Model Loaded! Preparing knowledge...");
    await prepareKnowledge();
    onProgress("Ready to chat!");
};

// 2. Prepare Knowledge (Simple Chunking)
const prepareKnowledge = async () => {
    const { portfolioKnowledge } = await import("./knowledge");

    // Split by newlines and filter empty
    knowledgeChunks = portfolioKnowledge.split("\n").filter(line => line.trim().length > 0);

    // In a real production app, we would generate vector embeddings here.
    // For this lightweight browser demo, we'll use a simple keyword/TF-IDF style matching 
    // to keep it fast and avoid loading a second heavy model.
    console.log("Knowledge chunks prepared:", knowledgeChunks.length);
};

// 3. Retrieve Top Chunks (Simple Similarity)
const retrieveContext = (question: string): string => {
    const queryWords = question.toLowerCase().split(/\s+/);

    // Score each chunk based on word overlap
    const scoredChunks = knowledgeChunks.map(chunk => {
        const chunkLower = chunk.toLowerCase();
        let score = 0;
        queryWords.forEach(word => {
            if (chunkLower.includes(word)) score++;
        });
        return { chunk, score };
    });

    // Sort by score and take top 3
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 3).map(item => item.chunk);

    return topChunks.join("\n");
};

// 4. Generate Answer
export const getAnswer = async (question: string, onUpdate: (text: string) => void) => {
    if (!engine) throw new Error("Model not initialized");

    const context = retrieveContext(question);

    const systemPrompt = `You are a helpful AI assistant for Yeamin HS's portfolio. 
  Use the following context to answer the user's question. 
  If the answer is not in the context, politely say you don't know but suggest contacting Yeamin.
  Keep answers concise and friendly.
  
  Context:
  ${context}`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
    ];

    const chunks = await engine.chat.completions.create({
        messages: messages as any,
        stream: true,
    });

    let fullResponse = "";
    for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullResponse += content;
        onUpdate(fullResponse);
    }

    return fullResponse;
};

// 5. Clear Cache (Utility)
export const clearCache = async () => {
    try {
        // Clear Cache API
        const keys = await caches.keys();
        for (const key of keys) {
            if (key.startsWith("webllm")) {
                await caches.delete(key);
            }
        }
        console.log("WebLLM Cache cleared");
    } catch (e) {
        console.error("Failed to clear cache:", e);
    }
};
