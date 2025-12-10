import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GestureControllerProps {
  onScatterChange: (scattered: boolean) => void;
  onCameraMove: (x: number, y: number) => void;
}

export const GestureController: React.FC<GestureControllerProps> = ({ onScatterChange, onCameraMove }) => {
  const videoRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const [streamActive, setStreamActive] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        
        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        // Setup Webcam
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadeddata = () => setStreamActive(true);
      } catch (err) {
        console.error("Gesture Controller Init Error:", err);
      }
    };

    init();

    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(t => t.stop());
        }
    }
  }, []);

  useFrame(() => {
    if (!streamActive || !gestureRecognizerRef.current || !videoRef.current) return;

    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        
        try {
            const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, Date.now());

            if (results.gestures.length > 0) {
                const gesture = results.gestures[0][0];
                const categoryName = gesture.categoryName;

                // 1. Gesture Logic
                if (categoryName === 'Open_Palm') {
                    onScatterChange(true); // Unleash
                } else if (categoryName === 'Closed_Fist') {
                    onScatterChange(false); // Assemble
                }

                // 2. Camera Move Logic based on Hand Position
                if (results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];
                    // Use the wrist (index 0) or average as a pivot
                    const wrist = landmarks[0];
                    
                    // MediaPipe coords: x (0 left -> 1 right), y (0 top -> 1 bottom)
                    // We want to map this to camera rotation.
                    // Center is 0.5, 0.5
                    const xDelta = (wrist.x - 0.5) * 2; // -1 to 1
                    const yDelta = (wrist.y - 0.5) * 2; // -1 to 1

                    onCameraMove(xDelta, yDelta);
                }
            }
        } catch (e) {
            // Ignore frame errors
        }
    }
  });

  return null; // Invisible component
};