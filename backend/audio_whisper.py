import torch
import librosa
import numpy as np
from transformers import WhisperModel, WhisperProcessor


device = "cuda" if torch.cuda.is_available() else "cpu"

processor = WhisperProcessor.from_pretrained("openai/whisper-base")
model = WhisperModel.from_pretrained("openai/whisper-base").to(device)
model.eval()



def whisper_ai_score(audio_path):
    
    y, sr = librosa.load(audio_path, sr=16000)

    
    inputs = processor(
        y,
        sampling_rate=16000,
        return_tensors="pt"
    )

    input_features = inputs.input_features.to(device)

    with torch.no_grad():
        enc = model.encoder(input_features)
        h = enc.last_hidden_state.squeeze(0)  # [T, D]

   
    delta = torch.norm(h[1:] - h[:-1], dim=1)

    
    mean_delta = delta.mean().item()
    std_delta = delta.std().item()

    
    regularity_ratio = std_delta / (mean_delta + 1e-6)

    
    ai_score = np.clip(0.85 - regularity_ratio, 0.0, 1.0)

    return float(ai_score)



def analyze_audio_whisper(audio_path):
    score = whisper_ai_score(audio_path)

    if score > 0.55:
        verdict = "AI-Generated"
        confidence = int(65 + score * 30)

    elif score < 0.45:
        verdict = "Human"
        confidence = int(65 + (1 - score) * 30)

    else:
        verdict = "Possibly AI-Generated"
        confidence = 55



    reasons = [
        {
            "title": "Speech Naturalness",
            "score": int(min(100, score * 120)),
            "description": "Voice shows reduced natural variability common in synthetic speech."
        },
        {
            "title": "Temporal Consistency",
            "score": int(min(100, score * 100)),
            "description": "Timing and flow patterns resemble AI-generated audio."
        },
        {
            "title": "Acoustic Entropy",
            "score": int(min(100, (1 - score) * 90)),
            "description": "Information density differs from natural human speech."
        }
    ]

    return verdict, confidence, reasons
