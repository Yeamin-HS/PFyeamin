import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { initModel, getAnswer } from '@/lib/ai/engine';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModelReady, setIsModelReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm Yeamin's AI assistant. Ask me anything about his projects or skills!" }
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleOpen = () => {
        setIsOpen(true);
        if (!isModelReady) {
            initModel((progress) => {
                setLoadingProgress(progress);
                if (progress.includes("Ready")) {
                    setIsModelReady(true);
                }
            }).catch(err => {
                console.error("Failed to load model:", err);
                setLoadingProgress("Error loading model. Please refresh.");
            });
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsGenerating(true);

        try {
            // Add placeholder for AI response
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            await getAnswer(userMsg, (text) => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = text;
                    return newMsgs;
                });
            });
        } catch (error) {
            console.error("Generation error:", error);
            setMessages(prev => [...prev, { role: 'system', content: "Sorry, something went wrong." }]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {/* Floating Icon */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <Button
                            size="icon"
                            className="w-16 h-16 rounded-full bg-gradient-primary shadow-2xl hover:scale-110 transition-transform duration-300"
                            onClick={handleOpen}
                        >
                            <MessageCircle className="w-8 h-8 text-white" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-8 right-8 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold font-display">Yeamin's AI Assistant</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                                <Minimize2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {!isModelReady ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground animate-pulse">{loadingProgress || "Initializing..."}</p>
                                    <p className="text-xs text-muted-foreground/50">Downloading ~600MB model (once only)</p>

                                    {/* Retry / Clear Cache Button */}
                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                setLoadingProgress("Clearing cache...");
                                                const { clearCache } = await import('@/lib/ai/engine');
                                                await clearCache();
                                                window.location.reload();
                                            }}
                                            className="text-xs"
                                        >
                                            Stuck? Click to Reset & Retry
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    ref={scrollRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                                >
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-muted/50 border border-border/50 rounded-tl-none'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isGenerating && (
                                        <div className="flex justify-start">
                                            <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75" />
                                                <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border/50 bg-background/50">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={isModelReady ? "Ask about my projects..." : "Waiting for model..."}
                                    disabled={!isModelReady || isGenerating}
                                    className="flex-1 bg-background/50"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!isModelReady || isGenerating || !input.trim()}
                                    className="bg-gradient-primary"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
