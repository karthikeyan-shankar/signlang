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
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          🧠 Kinnova ISL Engine
        </h3>
        <span className="text-[#00D4AA] text-xs font-semibold bg-[#00D4AA]/10 px-2.5 py-1 rounded-full border border-[#00D4AA]/20">
          AI Classifier Ready
        </span>
      </div>

      {/* Live Classifier Feedback Screen */}
      <div className="bg-black/35 rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center min-h-[140px] text-center">
        {currentMatch ? (
          <div className="w-full flex flex-col items-center">
            <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-1">
              Live Sign Detected
            </span>
            <div className="text-3xl font-extrabold text-[#00D4AA] mb-3 animate-pulse">
              {currentMatch.name}
            </div>

            {/* Confidence Slider Bar */}
            <div className="w-full max-w-[240px] bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#6C3FC5] to-[#00D4AA] h-full rounded-full transition-all duration-150"
                style={{ width: `${currentMatch.confidence * 100}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs">
              Confidence Score: {Math.round(currentMatch.confidence * 100)}%
            </p>
            <p className="text-[#4A90E2] text-xs font-medium mt-1 animate-pulse">
              Hold pose to translate...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl animate-pulse">🤟</span>
            <p className="text-gray-400 text-sm font-medium">
              Show your hands to the camera
            </p>
            <p className="text-gray-500 text-xs max-w-xs">
              Align your gestures to match the dictionary items listed below.
            </p>
          </div>
        )}
      </div>

      {/* Confirmed Translation Flash Alert */}
      {confirmedWord && (
        <div className="bg-gradient-to-r from-[#6C3FC5]/30 to-[#00D4AA]/30 border border-[#00D4AA]/50 rounded-xl p-3 text-center animate-bounce">
          <p className="text-[#00D4AA] text-sm font-bold">
            Translated: <span className="text-white underline">{confirmedWord}</span>
          </p>
        </div>
      )}

      {/* Dictionary Profiles (Visual Matching Progress) */}
      <div className="space-y-3">
        <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">
          ISL Dictionary Profiles
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(ISL_DICTIONARY).map((key) => {
            const label = ISL_DICTIONARY[key].name;
            const score = similarityScores[key] || 0;
            const percent = Math.round(score * 100);
            
            return (
              <div
                key={key}
                className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between transition hover:bg-white/10"
              >
                <span className="text-white text-xs font-semibold">{label}</span>
                <div className="flex items-center gap-3">
                  {/* Progress Indicator */}
                  <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        score >= CONFIDENCE_THRESHOLD ? "bg-[#00D4AA]" : "bg-[#6C3FC5]"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      score >= CONFIDENCE_THRESHOLD ? "text-[#00D4AA]" : "text-gray-400"
                    }`}
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
