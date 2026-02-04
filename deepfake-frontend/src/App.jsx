import { Routes, Route, useNavigate } from "react-router-dom";
import ImageUpload from "./pages/ImageUpload";
import VideoUpload from "./pages/VideoUpload";
import AudioUpload from "./pages/AudioUpload";
import LinkUpload from "./pages/LinkUpload";
import "./App.css";

function Home() {
  const navigate = useNavigate();

  return (
  <div className="home-wrapper">
    <div className="home-container">
      <h1>Real / Deep Fake Detector</h1>
      <p className="subtitle">
        Select the content type you want to analyze
      </p>

      <div className="options">
        <div className="card" onClick={() => navigate("/image")}>
          <div className="icon">🖼️</div>
          <span>Image</span>
        </div>

        <div className="card" onClick={() => navigate("/video")}>
          <div className="icon">🎥</div>
          <span>Video</span>
        </div>

        <div className="card" onClick={() => navigate("/audio")}>
          <div className="icon">🎧</div>
          <span>Audio</span>
        </div>

        <div className="card" onClick={() => navigate("/link")}>
          <div className="icon">🔗</div>
          <span>Link</span>
        </div>
      </div>
    </div>
  </div>
);

}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/image" element={<ImageUpload />} />
      <Route path="/video" element={<VideoUpload />} />
      <Route path="/audio" element={<AudioUpload />} />
      <Route path="/link" element={<LinkUpload />} />
    </Routes>
  );
}

export default App;
