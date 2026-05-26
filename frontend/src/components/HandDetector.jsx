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
        // Draw connection lines (Electric Blue)
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
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '16/9', 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        borderRadius: '1.25rem', 
        overflow: 'hidden', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)' 
      }}
    >
      {/* Video element - FORCED display: none to prevent double rendering */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />

      {/* Canvas displaying neon hand overlays - scaleX(-1) mirrors camera view correctly */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          transform: 'scaleX(-1)' 
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(13, 13, 43, 0.95)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10 
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>📷</div>
          <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Initialising Camera...</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Please allow camera permissions when prompted.</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(13, 13, 43, 0.95)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1.5rem', 
            textAlign: 'center', 
            zIndex: 10 
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h4 style={{ color: '#F87171', fontWeight: 'bold', fontSize: '18px' }}>System Alert</h4>
          <p style={{ color: 'white', fontSize: '13px', marginTop: '8px', maxWidth: '320px' }}>{error}</p>
        </div>
      )}

      {/* Active Tracking Status Badge */}
      {isDetecting && !isLoading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '1rem', 
            left: '1rem', 
            backgroundColor: 'rgba(0, 212, 170, 0.15)', 
            color: '#00D4AA', 
            padding: '0.4rem 1rem', 
            borderRadius: '50px', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            border: '1px solid rgba(0, 212, 170, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backdropFilter: 'blur(8px)', 
            WebkitBackdropFilter: 'blur(8px)', 
            zIndex: 5 
          }}
        >
          <span className="status-dot" style={{ width: '8px', height: '8px', boxShadow: '0 0 8px #00D4AA' }} />
          Camera Feed & Gesture Tracking Active
        </div>
      )}
    </div>
  );
}
