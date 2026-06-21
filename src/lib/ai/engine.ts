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

    const context = portfolioKnowledge;

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
    return `You are a friendly, intelligent AI assistant embedded in Yeamin HS's portfolio website.
Your main job is to answer visitor questions about Yeamin — his skills, projects, education, experience, interests, location, contact info, and background.

Rules:
- For questions about Yeamin, prioritize using the context provided below. If the information is not in the context but you know it generally, answer accurately, or suggest contacting Yeamin directly.
- If the visitor asks general or random questions (e.g., programming help, general knowledge, math, greeting, trivia), feel free to answer them directly using your pre-trained knowledge in a friendly, helpful manner.
- Keep answers relatively concise and engaging.
- Use markdown formatting when helpful.

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
            "Yeamin's key skills include AI/ML (Deep Learning, TensorFlow.js, NLP, Computer Vision) and Full-Stack Development (React, Node.js, Express.js, TypeScript, Tailwind CSS). He also has experience in cloud & DevOps (Docker, CI/CD), embedded hardware (Arduino, Raspberry Pi), and mathematical tools like Mathematica.";
    } else if (q.includes("experience") || q.includes("work") || q.includes("job") || q.includes("intern") || q.includes("teaching") || q.includes("assistant")) {
        answer =
            "Yeamin worked as an Intern at the IT Division of Prime Bank (March–May 2026), building an autonomous SQL querying AI agent, a Cursor/Copilot-like Visual Studio IDE extension, and a JetBrains coding assistant plugin (OLLAMA-JET).\n\nHe also served as an Undergraduate Teaching Assistant at BRAC University (Jan 2024–May 2025) for Statistics, Calculus, Discrete Mathematics, and Physics.";
    } else if (q.includes("project")) {
        answer =
            "Yeamin's notable projects include:\n\n1. **Smart Medicine Assistant** — integrating Gemini 1.5 and custom NLP for disease prediction.\n2. **University Club Monitoring System** — with conflict-free scheduling and custom multi-role dashboard.\n3. **Stress Level Classification** — a machine learning project using Random Forest to classify stress from physiological data.\n4. **CGPA Calculator** — a Django and Tailwind-based interactive web application.";
    } else if (q.includes("cgpa") || q.includes("gpa") || q.includes("grade") || q.includes("result")) {
        answer =
            "Yeamin obtained a CGPA of 3.86/4.00 for his BSc in Computer Science & Engineering from BRAC University. For his Higher Secondary Certificate (HSC), he achieved a GPA of 4.67/5.00, and for his Secondary School Certificate (SSC), he scored a GPA of 4.56/5.00.";
    } else if (q.includes("interest") || q.includes("hobby") || q.includes("hobbies") || q.includes("passion") || q.includes("like") || q.includes("love")) {
        answer =
            "Yeamin's primary interests are in Deep Learning, Computer Vision, Natural Language Processing (NLP), Full-Stack Web Development, and Mathematics (Calculus & Algorithms). He also enjoys robotics and creating mathematical art using Desmos.";
    } else if (q.includes("live") || q.includes("resident") || q.includes("home") || q.includes("city") || q.includes("location") || q.includes("address") || q.includes("from")) {
        answer =
            "Yeamin lives in Badda, Dhaka, Bangladesh.";
    } else if (q.includes("education") || q.includes("university") || q.includes("study") || q.includes("school") || q.includes("college")) {
        answer =
            "Yeamin graduated with a BSc in Computer Science & Engineering from BRAC University, Dhaka (2021-2025) with a CGPA of 3.86. Prior to university, he completed his HSC at Metropolitan School & College (GPA: 4.67) and SSC at Shyampur GOVT Model School & College (GPA: 4.56).";
    } else if (q.includes("referee") || q.includes("reference")) {
        answer =
            "Yeamin's referees are:\n\n1. **Dewan Ziaul Karim** (Senior Lecturer, BRAC University) — ziaul.karim@bracu.ac.bd\n2. **Afia Mubassira Islam** (Graduate Research Associate, Ohio State University / BRAC University Lecturer) — afia.islam@bracu.ac.bd";
    } else if (q.includes("extracurricular") || q.includes("club") || q.includes("robotics")) {
        answer =
            "Yeamin has been actively involved in extracurricular activities at BRAC University:\n- **Director of Human Resources** at BRAC University Computer Club (Oct 2023 – Dec 2024)\n- **Senior Executive** at BRAC University Robotics Club (Feb 2022 – Feb 2023)\n- **Organizing Committee Member** for INTRAHACTIVE 1.0 (Nov 2024)";
    } else if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("reach")) {
        answer =
            "You can reach Yeamin at:\n- **Email:** yeaminhs11@gmail.com\n- **Phone:** +8801521331128\n- **Location:** Badda, Dhaka, Bangladesh\n- **LinkedIn:** linkedin.com/in/yeaminhs";
    } else if (q.includes("thesis") || q.includes("publication") || q.includes("research") || q.includes("paper")) {
        answer =
            'Yeamin\'s thesis is titled "Leveraging Deep Learning Techniques for Pothole Detection" (Second Author, supervised by Dewan Ziaul Karim). He also co-authored the conference paper "Lightweight Deep Learning Framework for Pothole Detection and Classification Using CNNs and YOLO Models" published in the 28th ICCIT 2025 (DOI: 10.1109/ICCIT68739.2025.11491787).';
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
            "I'm currently running in offline fallback mode without an active Gemini API key, so I can only answer specific questions about Yeamin (like skills, projects, CGPA, interests, etc.). Please define VITE_GEMINI_API_KEY in your environment to ask general and random questions!";
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
