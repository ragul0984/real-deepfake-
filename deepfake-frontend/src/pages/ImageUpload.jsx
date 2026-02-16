import { useRef, useState, useEffect } from "react";
import "../upload.css";
import { motion } from "framer-motion";
import { generateReport } from "../utils/generatePDF";


import OrbBackground from "../components/OrbBackground";

export default function ImageUpload({ addToHistory }) {
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


  const openFilePicker = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const analyzeImage = async () => {
    setLoading(true);

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % loadingStages.length);
    }, 900);

    const formData = new FormData();
    formData.append("file", file);

    setStageIndex(0);
    const res = await fetch("http://localhost:5000/analyze/image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    clearInterval(interval);
    setPendingResult(data);


    setTimeout(() => {
      setResult(data);
      setLoading(false);

      if (addToHistory && data) {
        addToHistory({
          type: "Image",
          icon: "🖼️",
          name: file.name,
          verdict: data.verdict,
          confidence: data.confidence,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          path: "/image"
        });
      }
    }, loadingStages.length * 900);

  };


  const displayVerdict =
    result?.confidence <= 10
      ? "Likely Real"
      : result?.confidence >= 85
        ? "Likely AI-Generated"
        : result?.verdict;

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
        <h1 className="upload-title" style={{ paddingBottom: "20px" }}>Image Deepfake Detection</h1>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />

        <div className="upload-area" onClick={openFilePicker}>
          {preview ? (
            <img src={preview} className="image-preview" />
          ) : (
            <>
              <div className="upload-icon">📷</div>
              <div className="upload-text">Click to upload image</div>
            </>
          )}
        </div>

        {file && !loading && !result && (
          <button className="analyze-btn" onClick={analyzeImage}>
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
              <h2 className={`verdict-title ${displayVerdict.toLowerCase().includes("ai") ? "verdict-ai" : "verdict-real"}`}>
                {displayVerdict}
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
                  className={`confidence-bar-fill ${displayVerdict.toLowerCase().includes("ai") ? "bar-ai" : "bar-real"}`}
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
