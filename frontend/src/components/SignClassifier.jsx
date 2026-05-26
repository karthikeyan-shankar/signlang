import React, { useEffect, useState, useRef } from "react";
import { ISL_DICTIONARY } from "../utils/islDictionary";
import { normalizeLandmarks, calculateSimilarity } from "../utils/normalizeHand";

const CONFIDENCE_THRESHOLD = 0.90; // 90% match threshold
const CONFIRMATION_TIME = 1200;    // 1.2 seconds hold-time

export default function SignClassifier({ landmarks, onSignDetected }) {
  const [currentMatch, setCurrentMatch] = useState(null);
  const [similarityScores, setSimilarityScores] = useState({});
  const [confirmedWord, setConfirmedWord] = useState("");
  
  const lastActiveSign = useRef("");
  const confirmationTimer = useRef(null);

  // Process landmarks when they are captured
  useEffect(() => {
    if (!landmarks) {
      setCurrentMatch(null);
      setSimilarityScores({});
      clearTimeout(confirmationTimer.current);
      lastActiveSign.current = "";
      return;
    }

    // 1. Normalize live hand landmarks
    const normalized = normalizeLandmarks(landmarks);
    if (!normalized) return;

    // 2. Compare against every gesture in our ISL Dictionary
    let bestMatchName = "";
    let highestScore = 0;
    const scores = {};

    Object.keys(ISL_DICTIONARY).forEach((key) => {
      const template = ISL_DICTIONARY[key].landmarks;
      const score = calculateSimilarity(normalized, template);
      scores[key] = score;

      if (score > highestScore) {
        highestScore = score;
        bestMatchName = key;
      }
    });

    setSimilarityScores(scores);

    // 3. Evaluate if best match satisfies high-confidence threshold
    if (highestScore >= CONFIDENCE_THRESHOLD) {
      setCurrentMatch({
        key: bestMatchName,
        name: ISL_DICTIONARY[bestMatchName].name,
        confidence: highestScore
      });

      // 4. Trigger validation timer if this is a new sign
      if (lastActiveSign.current !== bestMatchName) {
        lastActiveSign.current = bestMatchName;
        clearTimeout(confirmationTimer.current);

        confirmationTimer.current = setTimeout(() => {
          // Confirm sign gesture!
          confirmSign(bestMatchName);
        }, CONFIRMATION_TIME);
      }
    } else {
      // Clear matching states if hands move away
      setCurrentMatch(null);
      clearTimeout(confirmationTimer.current);
      lastActiveSign.current = "";
    }
  }, [landmarks]);

  const confirmSign = (signKey) => {
    const word = ISL_DICTIONARY[signKey].name;
    setConfirmedWord(word);
    onSignDetected(word);
    
    // Auto-clear confirmed status after 2.5s for dynamic visualization
    setTimeout(() => {
      setConfirmedWord("");
    }, 2500);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div className="classifier-title" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <h3 className="tips-title" style={{ color: 'white', margin: 0, fontSize: '15px' }}>
          🧠 Kinnova ISL Engine
        </h3>
        <span className="badge-status" style={{ fontSize: '9px', padding: '4px 10px', background: 'var(--accent-teal-glass)' }}>
          AI Classifier Ready
        </span>
      </div>

      {/* Live Classifier Feedback Screen */}
      <div className="classifier-screen">
        {currentMatch ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Live Sign Detected
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-teal)', marginBottom: '0.75rem', textShadow: '0 0 10px rgba(0, 212, 170, 0.2)' }}>
              {currentMatch.name}
            </div>

            {/* Confidence Slider Bar */}
            <div className="confidence-bar-wrap">
              <div
                className="confidence-bar"
                style={{ width: `${currentMatch.confidence * 100}%` }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Confidence Score: {Math.round(currentMatch.confidence * 100)}%
            </p>
            <p style={{ fontSize: '10px', color: 'var(--accent-blue)', marginTop: '0.25rem', fontWeight: '500' }}>
              Hold pose to translate...
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🤟</span>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Show your hands to the camera
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '200px' }}>
              Align your gestures to match the dictionary items listed below.
            </p>
          </div>
        )}
      </div>

      {/* Confirmed Translation Flash Alert */}
      {confirmedWord && (
        <div className="confirm-alert">
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-teal)' }}>
            Translated: <span style={{ color: 'white', textDecoration: 'underline' }}>{confirmedWord}</span>
          </p>
        </div>
      )}

      {/* Dictionary Profiles (Visual Matching Progress) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 className="caption-label">
          ISL Dictionary Profiles
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.keys(ISL_DICTIONARY).map((key) => {
            const label = ISL_DICTIONARY[key].name;
            const score = similarityScores[key] || 0;
            const percent = Math.round(score * 100);
            
            return (
              <div key={key} className="score-row">
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Progress Indicator */}
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${
                        score >= CONFIDENCE_THRESHOLD ? "progress-fill-teal" : "progress-fill-violet"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span
                    className="mono"
                    style={{ 
                      fontSize: '11px', 
                      fontFamily: 'monospace', 
                      fontWeight: 'bold',
                      color: score >= CONFIDENCE_THRESHOLD ? 'var(--accent-teal)' : 'var(--text-secondary)'
                    }}
                  >
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
