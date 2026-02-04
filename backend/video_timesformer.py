import torch
import cv2
import numpy as np
from transformers import TimesformerForVideoClassification, AutoImageProcessor

# Load model ONCE
model = TimesformerForVideoClassification.from_pretrained(
    "facebook/timesformer-base-finetuned-k400"
)
processor = AutoImageProcessor.from_pretrained(
    "facebook/timesformer-base-finetuned-k400"
)

model.eval()

def timesformer_ai_score(video_path):
    cap = cv2.VideoCapture(video_path)
    frames = []

    # sample frames
    while len(frames) < 8:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frames.append(frame)

    cap.release()

    if len(frames) < 4:
        return 0.5  # neutral fallback

    inputs = processor(
        frames,
        return_tensors="pt"
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    # label 1 = FAKE (in this model)
    fake_prob = probs[0][1].item()

    return float(fake_prob)
