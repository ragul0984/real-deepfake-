import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ImageUpload from "./pages/ImageUpload";
import VideoUpload from "./pages/VideoUpload";
import AudioUpload from "./pages/AudioUpload";
import LinkUpload from "./pages/LinkUpload";
import "./App.css";
import { AnimatePresence, motion } from "framer-motion";
import AuroraBackground from "./components/AuroraBackground";

import { useState, useCallback } from "react";
import ChatBot from "./components/ChatBot";

function Home({ history }) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AuroraBackground />
      <div style={{
        position: "absolute",
        top: "30px",
        left: "40px",
        zIndex: 10,
        fontFamily: "'Inter', sans-serif",
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.6)",
        letterSpacing: "1px",
        pointerEvents: "none"
      }}>
        TruthLens.ai
      </div>
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <motion.h1
          className="home-title"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
        >
          Deep Fake Detector
        </motion.h1>

        <motion.p
          className="home-subtitle"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Detect AI-generated or manipulated images, videos, audio, suspicious links
        </motion.p>

        <div className="home-grid">
          {[
            { path: "/image", icon: "🖼️", title: "Image", desc: "Detect AI-generated images" },
            { path: "/video", icon: "🎥", title: "Video", desc: "Analyze deepfake videos" },
            { path: "/audio", icon: "🎤", title: "Audio", desc: "Identify synthetic voices" },
            { path: "/link", icon: "🔗", title: "Link", desc: "Check phishing & scam URLs" }
          ].map((item, index) => (
            <motion.div
              key={item.path}
              className="home-card"
              onClick={() => navigate(item.path)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(30, 41, 59, 1)",
                borderColor: "#38bdf8",
                boxShadow: "0 0 25px rgba(56, 189, 248, 0.6)",
                transition: { duration: 0.1, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="home-icon"
              >
                {item.icon}
              </motion.span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* --- RECENT ANALYSIS HISTORY SECTION --- */}
        {history && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: "40px",
              width: "80%",
              maxWidth: "1000px",
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}
          >
            <h3 style={{ color: "#94a3b8", fontSize: "1.2rem", borderBottom: "1px solid rgba(148, 163, 184, 0.3)", paddingBottom: "10px" }}>
              🕒 Recent Analysis History
            </h3>
            <div style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
              paddingBottom: "15px",
              scrollbarWidth: "thin",
              scrollbarColor: "#38bdf8 transparent"
            }}>
              {history.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    minWidth: "220px",
                    backgroundColor: "rgba(30, 41, 59, 0.6)",
                    backdropFilter: "blur(5px)",
                    border: `1px solid ${item.verdict.toLowerCase().includes("ai") ? "#ef4444" : "#22c55e"}`,
                    borderRadius: "10px",
                    padding: "15px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    cursor: "pointer"
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                    <span style={{
                      fontSize: "0.8rem",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: item.verdict.toLowerCase().includes("ai") ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                      color: item.verdict.toLowerCase().includes("ai") ? "#fca5a5" : "#86efac",
                      fontWeight: "bold"
                    }}>
                      {item.verdict}
                    </span>
                  </div>
                  <div style={{ color: "#e2e8f0", fontSize: "0.95rem", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    Confidence: {item.confidence}%
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", alignSelf: "flex-end" }}>
                    {item.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}


        <motion.p
          className="footer-credit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Built for Deepfake Detection Hackathon · Supports Image, Video, Audio & URL Analysis
        </motion.p>
      </div>
    </motion.div>
  );
}

function App() {
  const location = useLocation();
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((item) => {
    console.log("Adding to history:", item);
    setHistory((prev) => {
      console.log("Previous history:", prev);
      const newHistory = [item, ...prev];
      console.log("New history:", newHistory);
      return newHistory;
    });
  }, []);

  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home history={history} />} />
        <Route path="/image" element={<ImageUpload addToHistory={addToHistory} />} />
        <Route path="/video" element={<VideoUpload addToHistory={addToHistory} />} />
        <Route path="/audio" element={<AudioUpload addToHistory={addToHistory} />} />
        <Route path="/link" element={<LinkUpload addToHistory={addToHistory} />} />
      </Routes>
      <ChatBot />
    </>
  );
}

export default App;