import { useState } from "react";
import "../upload.css";

export default function LinkUpload() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
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

  return (
    <div className="upload-page">
      <h1 className="upload-title">Link Analysis</h1>
      <p className="upload-subtitle">
        Enter a link to check if it is real or suspicious
      </p>

      <div className="link-input-wrapper">
        <input
          type="text"
          className="link-input"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <button className="analyze-btn" onClick={handleAnalyze}>
        Analyze
      </button>

      {loading && <div className="loader">Analyzing link...</div>}

      {result && (
        <div className={`result ${result.verdict.toLowerCase().replace(" ", "-")}`}>
          <h3>{result.verdict}</h3>
          <p>Confidence: {result.confidence}%</p>

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
