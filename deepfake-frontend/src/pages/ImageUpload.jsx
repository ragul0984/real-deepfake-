import { useRef, useState } from "react";
import "../upload.css";

export default function ImageUpload() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/analyze/image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);
    setResult(data);
  };

  // 🔥 DISPLAY LOGIC FIX (UI ONLY)
  const displayVerdict =
    result?.confidence <= 10
      ? "Likely Real"
      : result?.confidence >= 85
      ? "Likely AI-Generated"
      : result?.verdict;

  return (
    <div className="upload-page">
      <h1 className="upload-title">Image Deepfake Detection</h1>

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

      {loading && <div className="loader">Analyzing...</div>}

      {result && (
        <div className={`result ${displayVerdict.toLowerCase().replace(" ", "-")}`}>
          <h2>{displayVerdict}</h2>
          <p>AI Probability: {result.confidence}%</p>
        </div>
      )}

      {result && (
        <div style={{ width: "100%", maxWidth: "400px", marginTop: "20px" }}>
          <div
            style={{
              height: "14px",
              background: "#1f2937",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #374151"
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${result.confidence}%`,
                background: displayVerdict.includes("AI")
                  ? "linear-gradient(90deg, #ef4444, #f97316)"
                  : "linear-gradient(90deg, #22c55e, #16a34a)",
                transition: "width 0.6s ease"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
