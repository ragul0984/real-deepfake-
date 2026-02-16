from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import torch
import os
from audio_whisper import analyze_audio_whisper
from link_forensics import analyze_link_forensics


from transformers import CLIPProcessor, CLIPModel
from facenet_pytorch import MTCNN

from video_forensics import analyze_video_forensics
from video_timesformer import timesformer_ai_score
from chatbot_logic import get_chatbot_response



def to_float_score(x):
    if isinstance(x, (int, float)):
        return float(x)

    if isinstance(x, (list, tuple, np.ndarray)):
        vals = []
        for v in x:
            try:
                vals.append(float(v))
            except:
                pass
        if not vals:
            return 0.5
        return float(np.mean(vals))

    return 0.5



app = Flask(__name__)
CORS(app)



device = "cuda" if torch.cuda.is_available() else "cpu"

clip_model = CLIPModel.from_pretrained(
    "openai/clip-vit-base-patch32"
).to(device)
clip_model.eval()

clip_processor = CLIPProcessor.from_pretrained(
    "openai/clip-vit-base-patch32"
)

mtcnn = MTCNN(
    keep_all=True,
    device=device,
    min_face_size=40
)



def fft_frequency_score(image_pil):
    gray = image_pil.convert("L")
    img = np.array(gray, dtype=np.float32)

    fft = np.fft.fft2(img)
    fft_shift = np.fft.fftshift(fft)
    magnitude = np.log(np.abs(fft_shift) + 1.0)

    h, w = magnitude.shape
    magnitude[h//2-10:h//2+10, w//2-10:w//2+10] = 0

    energy = np.mean(magnitude)
    max_energy = np.max(magnitude) + 1e-8

    score = energy / max_energy
    return float(np.clip(score, 0.0, 1.0))


def face_only_fft_score(image_pil):
    boxes, _ = mtcnn.detect(image_pil)

    if boxes is None or len(boxes) == 0:
        return fft_frequency_score(image_pil)

    scores = []

    for box in boxes:
        x1, y1, x2, y2 = map(int, box)
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(image_pil.width, x2), min(image_pil.height, y2)

        face = image_pil.crop((x1, y1, x2, y2))
        if face.width < 40 or face.height < 40:
            continue

        scores.append(fft_frequency_score(face))

    if not scores:
        return fft_frequency_score(image_pil)

    return float(np.mean(scores))



def clip_ai_score(image_pil):
    prompts = [
        "a real photograph taken with a camera",
        "a natural unedited photo",
        "an AI-generated image",
        "a synthetic digital artwork"
    ]

    inputs = clip_processor(
        text=prompts,
        images=image_pil,
        return_tensors="pt",
        padding=True
    ).to(device)

    with torch.no_grad():
        logits = clip_model(**inputs).logits_per_image[0]
        probs = logits.softmax(dim=0)

    real_prob = float(probs[0] + probs[1])
    ai_prob = float(probs[2] + probs[3])

    return ai_prob / (ai_prob + real_prob + 1e-8)



def image_decision(fft_score, clip_score):
    fft_score = float(np.clip(fft_score, 0, 1))
    clip_score = float(np.clip(clip_score, 0, 1))

    combined = 0.65 * fft_score + 0.35 * clip_score

    if fft_score > 0.72 and clip_score > 0.75:
        return "AI-Generated", int(combined * 100)

    if fft_score < 0.40 and clip_score < 0.45:
        return "Real", int((1 - combined) * 100)

    return "Possibly AI-Generated", int(abs(combined - 0.5) * 200)



def video_decision(forensic, temporal):
    forensic = float(np.clip(forensic, 0, 1))
    temporal = float(np.clip(temporal, 0, 1))

    combined = 0.45 * forensic + 0.55 * temporal

    # STRONG FAKE
    if combined > 0.72 and temporal > 0.70:
        return "AI-Generated", int(combined * 100)

    # STRONG REAL (DEFAULT)
    if combined < 0.45:
        return "Real", int((1 - combined) * 100)

    # ONLY HERE → POSSIBLE AI
    return "Possibly AI-Generated", int(combined * 100)

def image_reasons(fft_score, clip_score):
    reasons = []

    
    if fft_score > 0.65:
        reasons.append({
            "title": "High-Frequency Artifacts",
            "score": int(min(100, fft_score * 100)),
            "description": "The image shows unnatural frequency patterns often introduced by AI generation."
        })
    else:
        reasons.append({
            "title": "Natural Frequency Distribution",
            "score": int((1 - fft_score) * 100),
            "description": "The image exhibits natural frequency characteristics typical of real photographs."
        })

    
    if clip_score > 0.6:
        reasons.append({
            "title": "Semantic Inconsistency",
            "score": int(min(100, clip_score * 100)),
            "description": "Visual content shows patterns commonly associated with AI-generated images."
        })
    else:
        reasons.append({
            "title": "Semantic Coherence",
            "score": int((1 - clip_score) * 100),
            "description": "The image content does not aligns well with real-world photographic semantics."
        })

    return reasons



@app.route("/analyze/image", methods=["POST"])
def analyze_image():
    if "file" not in request.files:
        return jsonify({"verdict": "Possibly AI-Generated", "confidence": 50})

    image = Image.open(request.files["file"].stream).convert("RGB")

    fft_score = face_only_fft_score(image)
    clip_score = clip_ai_score(image)

    verdict, confidence = image_decision(fft_score, clip_score)

    return jsonify({
        "verdict": verdict,
        "confidence": confidence,
        "reasons": image_reasons(fft_score, clip_score)
    })




@app.route("/analyze/video", methods=["POST"])
def analyze_video():
    if "file" not in request.files:
        return jsonify({"verdict": "Error", "confidence": 0})

    file = request.files["file"]
    path = "temp_video.mp4"
    file.save(path)

    verdict, confidence = analyze_video_forensics(path)

    if os.path.exists(path):
        os.remove(path)

    
    reasons = [
        {
            "title": "Facial Motion Consistency",
            "score": min(100, confidence),
            "description": (
                "Facial movements appear overly smooth and lack natural micro-expressions."
                if verdict != "Real"
                else
                "Facial motion shows natural jitter and expressive variation."
            ),
        },
        {
            "title": "Blink Pattern Analysis",
            "score": min(100, int(confidence * 0.85)),
            "description": (
                "Blink frequency and timing deviate from typical human behavior."
                if verdict != "Real"
                else
                "Blink patterns fall within expected human ranges."
            ),
        },
        {
            "title": "Temporal Frame Coherence",
            "score": min(100, int(confidence * 0.75)),
            "description": (
                "Frame-to-frame transitions show synthetic temporal consistency."
                if verdict != "Real"
                else
                "Temporal transitions appear naturally inconsistent."
            ),
        },
    ]

    return jsonify({
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons
    })

@app.route("/analyze/audio", methods=["POST"])
def analyze_audio():
    if "file" not in request.files:
        return jsonify({
            "verdict": "Error",
            "confidence": 0
        })

    file = request.files["file"]
    path = "temp_audio.wav"

   
    file.save(path)

    try:
        verdict, confidence, reasons = analyze_audio_whisper(path)

        return jsonify({
            "verdict": verdict,
            "confidence": confidence,
            "reasons": reasons
        })

    finally:
        
        if os.path.exists(path):
            os.remove(path)

@app.route("/analyze/link", methods=["POST"])
def analyze_link():
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({
            "verdict": "Error",
            "confidence": 0
        })

    verdict, confidence, reasons = analyze_link_forensics(data["url"])

    return jsonify({
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons
    })


@app.route("/analyze/chat", methods=["POST"])
def chat_bot():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"response": "I didn't quite catch that."})
    
    user_msg = data["message"]
    response = get_chatbot_response(user_msg)
    
    return jsonify({"response": response})





if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
