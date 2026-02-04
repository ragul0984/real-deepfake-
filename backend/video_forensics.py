import cv2
import numpy as np
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

def eye_aspect_ratio(landmarks, eye):
    p = [landmarks[i] for i in eye]
    vertical = np.linalg.norm(p[1] - p[5]) + np.linalg.norm(p[2] - p[4])
    horizontal = 2.0 * np.linalg.norm(p[0] - p[3])
    return vertical / horizontal if horizontal != 0 else 0

def analyze_video_forensics(video_path, max_frames=150):
    cap = cv2.VideoCapture(video_path)

    landmark_movements = []
    blink_ratios = []
    prev_landmarks = None
    frame_count = 0

    while cap.isOpened() and frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = mp_face_mesh.process(rgb)

        if not result.multi_face_landmarks:
            continue

        landmarks = np.array([
            [lm.x, lm.y]
            for lm in result.multi_face_landmarks[0].landmark
        ])

        if prev_landmarks is not None:
            movement = np.mean(np.linalg.norm(landmarks - prev_landmarks, axis=1))
            landmark_movements.append(movement)

        left_ear = eye_aspect_ratio(landmarks, LEFT_EYE)
        right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE)
        blink_ratios.append((left_ear + right_ear) / 2)

        prev_landmarks = landmarks

    cap.release()

    if len(landmark_movements) < 10:
        return "Possibly AI-Generated", 50

    jitter_score = float(np.mean(landmark_movements))
    blink_variance = float(np.var(blink_ratios))

    forensic_score = (jitter_score * 8) + (blink_variance * 20)

    if forensic_score > 1.2:
        return "Likely AI-Generated", min(95, int(forensic_score * 70))
    elif forensic_score > 0.6:
        return "Possibly AI-Generated", min(80, int(forensic_score * 60))
    else:
        return "Real", max(55, 100 - int(forensic_score * 80))
  