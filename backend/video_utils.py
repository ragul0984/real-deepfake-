import cv2
import numpy as np
import torch
from facenet_pytorch import MTCNN
from torchvision import models, transforms
from PIL import Image

device = "cuda" if torch.cuda.is_available() else "cpu"


mtcnn = MTCNN(keep_all=False, device=device)


effnet = models.efficientnet_b0(weights="IMAGENET1K_V1")
effnet.classifier = torch.nn.Identity()
effnet = effnet.to(device).eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def analyze_video(video_path, max_frames=25):
    cap = cv2.VideoCapture(video_path)

    features = []
    fft_scores = []

    frame_count = 0

    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb)

        face = mtcnn(pil)
        if face is None:
            continue

        face_img = transforms.ToPILImage()(face.cpu())
        face_tensor = transform(face_img).unsqueeze(0).to(device)

        with torch.no_grad():
            feat = effnet(face_tensor).cpu().numpy()
            features.append(feat)

        
        gray = cv2.cvtColor(np.array(face_img), cv2.COLOR_RGB2GRAY)
        fft = np.fft.fft2(gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.log(np.abs(fft_shift) + 1)
        fft_scores.append(np.mean(magnitude))

    cap.release()

    if len(features) < 5:
        return "Suspicious", 55

    features = np.vstack(features)
    temporal_variance = np.mean(np.var(features, axis=0))
    fft_mean = np.mean(fft_scores)

    
    ai_score = (temporal_variance * 8) + (fft_mean * 0.15)

    if ai_score > 1.2:
        return "AI-Generated", min(95, int(ai_score * 70))
    elif ai_score > 0.7:
        return "Possibly AI-Generated", min(80, int(ai_score * 60))
    else:
        return "Real", max(55, 100 - int(ai_score * 80))
