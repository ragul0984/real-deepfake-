import { useRef, useState } from "react";
import "../upload.css";

export default function AudioUpload() {
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  // 🔹 CHANGE 1
  const displayVerdict =
    result && result.confidence < 30
      ? "Likely Human"
      : result && result.confidence > 70
      ? "Likely AI-Generated"
      : "Possibly AI-Generated";

  return (
    <div className="upload-page">
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

      {loading && <div className="loader">Analyzing audio...</div>}

      {result && (
        <div className={`result ${displayVerdict.toLowerCase().replace(" ", "-")}`}>
          {/* 🔹 CHANGE 2 */}
          <h3>{displayVerdict}</h3>

          {/* 🔹 CHANGE 3 */}
          <p>AI Likelihood: {result.confidence}%</p>

          {result.reasons && (
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
      )}
    </div>
  );
}
