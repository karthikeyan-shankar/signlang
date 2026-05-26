import React, { useEffect, useRef, useState } from "react";

export default function HandDetector({ onLandmarksDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setupCamera();
  }, []);

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsLoading(false);
          loadMediaPipe();
        };
      }
    } catch (err) {
      console.error("Camera setup error:", err);
      setError("Camera access denied. Please allow camera permission in your browser.");
      setIsLoading(false);
    }
  };

  const loadMediaPipe = async () => {
    try {
      // Access MediaPipe from global window populated by high-reliability CDNs
      const MP = window;
      if (!MP.Hands || !MP.Camera) {
        throw new Error("MediaPipe library not found on global scope.");
      }

      const hands = new MP.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.75,
      });

      hands.onResults((results) => {
        drawResults(results);
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          onLandmarksDetected(results.multiHandLandmarks[0]);
        } else {
          onLandmarksDetected(null);
        }
      });

      const camera = new MP.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
      setIsDetecting(true);
    } catch (err) {
      console.error("MediaPipe initialization error:", err);
      setError("Failed to load hand tracking system. Please refresh the page.");
    }
  };

  const drawResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Draw hand landmarks
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw connection lines (Electric Violet / Royal Blue)
        drawConnections(ctx, landmarks);

        // Draw joint points (Neon Cyan)
        for (const landmark of landmarks) {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          // Inner glowing core
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "#00D4AA"; // Neon Teal
          ctx.fill();

          // Outer pulsing ring
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(108, 63, 197, 0.8)"; // Neon Violet
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  };

  const drawConnections = (ctx, landmarks) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17],             // Palm
    ];

    ctx.strokeStyle = "rgba(64, 150, 238, 0.75)"; // Electric Blue
    ctx.lineWidth = 3;

    for (const [start, end] of connections) {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvasRef.current.width, startPoint.y * canvasRef.current.height);
      ctx.lineTo(endPoint.x * canvasRef.current.width, endPoint.y * canvasRef.current.height);
      ctx.stroke();
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black/60 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Video element (hidden) */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Canvas displaying neon hand overlays */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="w-full h-full object-cover scale-x-[-1]"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0D0D2B]/95 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4 animate-bounce">📷</div>
          <h4 className="text-white font-bold text-lg">Initialising Camera...</h4>
          <p className="text-gray-400 text-sm mt-1">Please allow camera permissions when prompted.</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-[#0D0D2B]/95 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-red-400 font-bold text-lg">System Alert</h4>
          <p className="text-gray-300 text-sm mt-2 max-w-sm">{error}</p>
        </div>
      )}

      {/* Active Tracking Status Badge */}
      {isDetecting && !isLoading && (
        <div className="absolute top-4 left-4 bg-[#00D4AA]/20 text-[#00D4AA] px-4 py-1.5 rounded-full text-xs font-bold border border-[#00D4AA]/30 flex items-center gap-2 backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D4AA] animate-pulse" />
          Camera Feed & Gesture Tracking Active
        </div>
      )}
    </div>
  );
}
