import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Deepfake Detection Assistant. How can I help you today?", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: "user"
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:5000/analyze/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: newUserMessage.text }),
            });

            const data = await response.json();

            const newBotMessage = {
                id: Date.now() + 1,
                text: data.response || "Sorry, I couldn't process that.",
                sender: "bot"
            };

            setMessages((prev) => [...prev, newBotMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages((prev) => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the server.",
                sender: "bot"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                            position: "fixed",
                            bottom: "80px",
                            right: "20px",
                            width: "350px",
                            height: "500px",
                            backgroundColor: "rgba(15, 23, 42, 0.85)", // slate-900 with opacity
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(56, 189, 248, 0.5)", // sky-400
                            borderRadius: "16px",
                            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2)",
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            fontFamily: "Arial, sans-serif"
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: "16px",
                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                            borderBottom: "1px solid rgba(56, 189, 248, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: "#38bdf8",
                                    boxShadow: "0 0 10px #38bdf8"
                                }} />
                                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>AI Assistant</span>
                            </div>
                            <button
                                onClick={toggleChat}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                    fontSize: "1.2rem"
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: "16px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            scrollbarWidth: "thin",
                            scrollbarColor: "#334155 transparent"
                        }}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                        maxWidth: "80%",
                                        padding: "10px 14px",
                                        borderRadius: "12px",
                                        backgroundColor: msg.sender === "user" ? "#38bdf8" : "rgba(30, 41, 59, 0.8)",
                                        color: msg.sender === "user" ? "#000" : "#e2e8f0",
                                        borderBottomRightRadius: msg.sender === "user" ? "2px" : "12px",
                                        borderBottomLeftRadius: msg.sender === "user" ? "12px" : "2px",
                                        border: msg.sender === "bot" ? "1px solid rgba(148, 163, 184, 0.2)" : "none",
                                        fontSize: "0.95rem",
                                        lineHeight: "1.4"
                                    }}
                                >
                                    {msg.text.split('\n').map((line, i) => (
                                        <div key={i} style={{ marginBottom: line.trim() === "" ? "8px" : "4px" }}>
                                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => (
                                                part.startsWith('**') && part.endsWith('**') ? (
                                                    <strong key={j} style={{ color: "#38bdf8" }}>
                                                        {part.slice(2, -2)}
                                                    </strong>
                                                ) : (
                                                    <span key={j}>{part}</span>
                                                )
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        alignSelf: "flex-start",
                                        padding: "10px 14px",
                                        borderRadius: "12px",
                                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                                        color: "#94a3b8",
                                        borderBottomLeftRadius: "2px",
                                        border: "1px solid rgba(148, 163, 184, 0.2)",
                                        fontSize: "0.9rem",
                                        fontStyle: "italic"
                                    }}
                                >
                                    Typing...
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} style={{
                            padding: "16px",
                            borderTop: "1px solid rgba(56, 189, 248, 0.3)",
                            display: "flex",
                            gap: "10px"
                        }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                                    border: "1px solid rgba(148, 163, 184, 0.3)",
                                    borderRadius: "20px",
                                    padding: "10px 16px",
                                    color: "#fff",
                                    outline: "none",
                                    fontSize: "0.95rem"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#38bdf8"}
                                onBlur={(e) => e.target.style.borderColor = "rgba(148, 163, 184, 0.3)"}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                style={{
                                    backgroundColor: "#38bdf8",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    color: "#0f172a",
                                    fontSize: "1.2rem"
                                }}
                            >
                                ➤
                            </motion.button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                onClick={toggleChat}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(56, 189, 248, 0.8)" }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    width: isOpen ? "50px" : "60px",
                    height: isOpen ? "50px" : "60px",
                    borderRadius: "50%",
                    backgroundColor: "#38bdf8",
                    border: "none",
                    cursor: "pointer",
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)"
                }}
            >
                <span style={{ fontSize: isOpen ? "1.5rem" : "2rem" }}>
                    {isOpen ? "✕" : "🤖"}
                </span>
            </motion.button>
        </>
    );
};

export default ChatBot;
