import { useRef, useState } from "react";
import "../upload.css";

export default function VideoUpload() {
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

      // ✅ ONLY FIX: normalize reasons so UI always renders safely
      setResult({
        ...data,
        reasons: data.reasons || [],
      });

    } catch (err) {
      console.error(err);
      alert("Backend not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
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

      {file && (
        <button className="analyze-btn" onClick={handleAnalyze}>
          Analyze
        </button>
      )}

      {loading && <div className="loader">Analyzing video...</div>}

      {result && (
        <div className={`result ${result.verdict.toLowerCase()}`}>
          <h3>{result.verdict}</h3>
          <p>Confidence: {result.confidence}%</p>

          {result.reasons.length > 0 && (
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
