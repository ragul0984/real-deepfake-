import { useRef, useState, useEffect } from "react";
import "../upload.css";
import { motion } from "framer-motion";
import OrbBackground from "../components/OrbBackground";
import { generateReport } from "../utils/generatePDF";

export default function AudioUpload() {
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
      alert("Please upload an audio file first");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze/audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend not responding");
    } finally {
      setLoading(false);
    }
  };


  const displayVerdict =
    result && result.confidence < 30
      ? "Likely Human"
      : result && result.confidence > 70
        ? "Likely AI-Generated"
        : "Possibly AI-Generated";

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
        <h1 className="upload-title">Audio Deepfake Detection</h1>
        <p className="upload-subtitle">
          Upload an audio file to check if the voice is AI-generated
        </p>

        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />

        <div className="upload-area" onClick={openFilePicker}>
          {preview ? (
            <audio
              src={preview}
              controls
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <div className="upload-icon">🎤</div>
              <div className="upload-text">Click to upload audio</div>
            </>
          )}
        </div>

        {file && (
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
          <div ref={resultRef}>
            <div className={`result ${displayVerdict.toLowerCase().replace(" ", "-")}`}>
              { }
              <h3>{displayVerdict}</h3>

              { }
              <p>AI Likelihood: {result.confidence}%</p>
              <button
                onClick={() => generateReport({ ...result, verdict: displayVerdict })}
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
                  gap: "6px",
                  marginTop: "10px"
                }}
              >
                📄 Download Report
              </button>
            </div>
          </div>
        )}
        {result?.reasons && (
          <div className="reason-list">
            {result.reasons.map((reason, idx) => (
              <div key={idx} className="reason-card">
                <div className="reason-header">
                  <span className="reason-title">{reason.title}</span>
                  <span className="reason-score">{reason.score}%</span>
                </div>

                <div className="reason-bar">
                  <div
                    className="reason-fill"
                    style={{ width: `${reason.score}%` }}
                  />
                </div>

                <p className="reason-desc">{reason.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="footer-credit">
        Built for Deepfake Detection Hackathon · Supports Image, Video, Audio & URL Analysis
      </p>

    </motion.div>
  );
}
