import { portfolioKnowledge } from "./knowledge";

// ============================================================
// Gemini-powered AI Engine for Portfolio Chatbot
// Uses Google's Gemini API (free tier: 15 RPM / 1M TPM)
// ============================================================

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

let knowledgeChunks: string[] = [];
let isReady = false;

// ---- Knowledge Preparation (simple chunking) ----

const prepareKnowledge = () => {
    knowledgeChunks = portfolioKnowledge
        .split("\n")
        .filter((line) => line.trim().length > 0);
    console.log("Knowledge chunks prepared:", knowledgeChunks.length);
};

// ---- Context Retrieval (keyword overlap scoring) ----

const retrieveContext = (question: string): string => {
    const queryWords = question.toLowerCase().split(/\s+/);

    const scoredChunks = knowledgeChunks.map((chunk) => {
        const chunkLower = chunk.toLowerCase();
        let score = 0;
        queryWords.forEach((word) => {
            if (word.length > 2 && chunkLower.includes(word)) score++;
        });
        return { chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks
        .slice(0, 5)
        .map((item) => item.chunk)
        .join("\n");
};

// ---- Public API ----

/**
 * Initialize the AI engine. Very lightweight — just prepares knowledge chunks.
 * The onProgress callback is kept for API compatibility with ChatBot.tsx.
 */
export const initModel = async (onProgress: (text: string) => void) => {
    if (isReady) return;

    onProgress("Preparing knowledge base...");
    prepareKnowledge();

    if (!GEMINI_API_KEY) {
        console.warn(
            "⚠️ VITE_GEMINI_API_KEY is not set. The chatbot will use a fallback mode."
        );
    }

    isReady = true;
    onProgress("Ready to chat!");
};

/**
 * Generate an answer by streaming from Gemini API.
 * Falls back to a simple local response if no API key is configured.
 */
export const getAnswer = async (
    question: string,
    onUpdate: (text: string) => void
): Promise<string> => {
    if (!isReady) throw new Error("Engine not initialized");

    const context = retrieveContext(question);

    // ---------- Fallback (no API key) ----------
    if (!GEMINI_API_KEY) {
        return fallbackAnswer(question, context, onUpdate);
    }

    // ---------- Gemini Streaming ----------
    const systemPrompt = buildSystemPrompt(context);

    const body = {
        contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood! I'm ready to answer questions about Yeamin HS based on the context you provided." }] },
            { role: "user", parts: [{ text: question }] },
        ],
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 514,
        },
    };

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API error:", response.status, errorText);
            // Fall back gracefully
            return fallbackAnswer(question, context, onUpdate);
        }

        // Parse SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
            return fallbackAnswer(question, context, onUpdate);
        }

        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // SSE format: each event line starts with "data: "
            const lines = chunk.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const text =
                            parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        if (text) {
                            fullResponse += text;
                            onUpdate(fullResponse);
                        }
                    } catch {
                        // Ignore broken JSON fragments
                    }
                }
            }
        }

        return fullResponse || "I couldn't generate a response. Please try again!";
    } catch (err) {
        console.error("Gemini fetch error:", err);
        return fallbackAnswer(question, context, onUpdate);
    }
};

/**
 * Utility: clear any cached data (kept for API compat).
 */
export const clearCache = async () => {
    isReady = false;
    knowledgeChunks = [];
    console.log("AI engine cache cleared");
};

// ============================================================
// Internal helpers
// ============================================================

function buildSystemPrompt(context: string): string {
    return `You are a friendly, concise AI assistant embedded in Yeamin HS's portfolio website.
Your job is to answer visitor questions about Yeamin — his skills, projects, education, experience, and contact info.

Rules:
- Use ONLY the context below to answer. Do NOT make up facts.
- If the answer is not in the context, say you don't know and suggest the visitor contact Yeamin directly.
- Keep answers short (2-4 sentences max) and friendly.
- Use markdown formatting when helpful (bold, lists).

Context:
${context}`;
}

async function fallbackAnswer(
    question: string,
    context: string,
    onUpdate: (text: string) => void
): Promise<string> {
    // Simple keyword-based fallback when no API key is available
    const q = question.toLowerCase();
    let answer = "";

    if (q.includes("skill") || q.includes("tech") || q.includes("stack")) {
        answer =
            "Yeamin's key skills include AI/ML (Deep Learning, TensorFlow.js, NLP, Computer Vision) and Full-Stack Development (React, Node.js, Express.js, TypeScript, Tailwind CSS). He also has strong mathematical foundations in algorithms and calculus.";
    } else if (q.includes("project")) {
        answer =
            "Yeamin has built several impressive projects:\n\n1. AI-Powered Medicine Help Platform — integrating Gemini 1.5 and custom NLP for disease prediction.\n2. Club Management & Recruitment System — with custom auth and real-time room scheduling.\n3. DESMOS Graphing Designing — artistic icons using mathematical functions.";
    } else if (q.includes("education") || q.includes("university") || q.includes("study")) {
        answer =
            "Yeamin is pursuing a BSc in Computer Science & Engineering at BRAC University, Dhaka (2021-2025) with a CGPA of 3.86. He completed his HSC at Metropolitan School & College (2018-2020).";
    } else if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("reach")) {
        answer =
            "You can reach Yeamin at:\n- Email: yeaminhs11@gmail.com\n- Phone: 01521331128\n- Location: Badda, Dhaka, Bangladesh";
    } else if (q.includes("thesis") || q.includes("publication") || q.includes("research") || q.includes("paper")) {
        answer =
            'Yeamin\'s thesis is titled "Leveraging Deep Learning Techniques for Pothole Detection" (Second Author). He also published a paper: "Lightweight Deep Learning Framework for Pothole Detection and Classification Using CNNs and YOLO Models" at the 28th ICCIT 2025.';
    } else if (q.includes("who") || q.includes("about") || q.includes("yourself") || q.includes("yeamin")) {
        answer =
            "Yeamin HS is a Software Engineer & AI/ML Enthusiast based in Dhaka, Bangladesh. He's passionate about building intelligent solutions with cutting-edge AI and believes every great solution begins with understanding the underlying mathematics.";
    } else if (q.match(/^(hi|hey|hello|howdy|greetings|good morning|good afternoon|good evening|sup|yo|hola|what's up|whats up)\b/i) || q.includes("how are you")) {
        answer =
            "Hey there! 👋 Welcome to Yeamin's portfolio! I can help you learn about his skills, projects, education, research, or contact info. What would you like to know?";
    } else if (q.includes("thank") || q.includes("thanks") || q.includes("bye") || q.includes("goodbye")) {
        answer =
            "You're welcome! Feel free to come back anytime. If you'd like to get in touch with Yeamin, reach out at yeaminhs11@gmail.com. Have a great day! 😊";
    } else {
        answer =
            "I appreciate your question! I don't have specific information about that in my knowledge base. Feel free to reach out to Yeamin directly at yeaminhs11@gmail.com for more details!";
    }

    // Simulate streaming effect for a natural feel
    const words = answer.split(" ");
    let streamed = "";

    for (let i = 0; i < words.length; i++) {
        streamed += (i === 0 ? "" : " ") + words[i];
        onUpdate(streamed);
        await new Promise((r) => setTimeout(r, 25));
    }

    return answer;
}
