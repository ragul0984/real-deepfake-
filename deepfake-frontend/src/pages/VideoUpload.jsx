import { useRef, useState, useEffect } from "react";
import "../upload.css";
import { motion } from "framer-motion";
import OrbBackground from "../components/OrbBackground";
import { generateReport } from "../utils/generatePDF";

export default function VideoUpload({ addToHistory }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const resultRef = useRef(null);
  const [pendingResult, setPendingResult] = useState(null);




  const loadingStages = [
    "Extracting features…",
    "Running forensic analysis…",
    "Evaluating authenticity…",
    "Finalizing result…",
  ];


  const openFilePicker = () => {
    if (!preview) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a video first");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze/video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();


      setResult({
        ...data,
        reasons: data.reasons || [],
      });

      if (addToHistory && data) {
        addToHistory({
          type: "Video",
          icon: "🎥",
          name: file.name,
          verdict: data.verdict,
          confidence: data.confidence,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          path: "/video"
        });
      }

    } catch (err) {
      console.error(err);
      alert("Backend not responding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result]);


  return (
    <motion.div
      className="upload-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <OrbBackground />
      <div style={{ position: "relative", zIndex: 1, width: "100%", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h1 className="upload-title">Video Deepfake Detection</h1>
        <p className="upload-subtitle">
          Upload a video to analyze whether it is real or manipulated
        </p>

        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />

        <div className="upload-area" onClick={openFilePicker}>
          {preview ? (
            <video
              src={preview}
              className="video-preview"
              controls
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <div className="upload-icon">🎥</div>
              <div className="upload-text">Click to upload video</div>
            </>
          )}
        </div>

        {file && !loading && !result && (
          <button className="analyze-btn" onClick={handleAnalyze}>
            Analyze
          </button>
        )}

        {loading && (
          <div className="loader">
            <div className="spinner"></div>
            <p>{loadingStages[stageIndex]}</p>
          </div>
        )}

        {result && (
          <div className="result-container" ref={resultRef}>
            <div className="result-header">
              <h2 className={`verdict-title ${result.verdict.toLowerCase().includes("ai") ? "verdict-ai" : "verdict-real"}`}>
                {result.verdict}
              </h2>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <p className="confidence-text">Confidence: {result.confidence}%</p>
                <button
                  onClick={() => generateReport(result)}
                  style={{
                    backgroundColor: "#38bdf8",
                    color: "#0f172a",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  📄 Report
                </button>
              </div>

              <div className="confidence-bar-wrapper">
                <div
                  className={`confidence-bar-fill ${result.verdict.toLowerCase().includes("ai") ? "bar-ai" : "bar-real"}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {result.reasons && (
              <div className="reasons-container">
                {result.reasons.map((reason, idx) => (
                  <div key={idx} className="reason-card">
                    <div className="reason-header">
                      <span className="reason-title">{reason.title}</span>
                      <span className="reason-score">{reason.score}%</span>
                    </div>
                    <div className="reason-mini-bar">
                      <div
                        className={`reason-mini-fill ${reason.score > 50 ? "bar-ai" : "bar-real"}`}
                        style={{ width: `${reason.score}%` }}
                      />
                    </div>
                    <p className="reason-desc">{reason.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="footer-credit">
        Built for Deepfake Detection Hackathon · Supports Image, Video, Audio & URL Analysis
      </p>

    </motion.div>
  );
}
