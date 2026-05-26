import React, { useState } from "react";
import HandDetector from "./components/HandDetector";
import SignClassifier from "./components/SignClassifier";
import VoicePlayback from "./components/VoicePlayback";
import { Sparkles, Trash2, Copy, Check } from "lucide-react";

export default function App() {
  const [landmarks, setLandmarks] = useState(null);
  const [activeCaption, setActiveCaption] = useState("");
  const [sentenceList, setSentenceList] = useState([]);
  const [speechPayload, setSpeechPayload] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSignDetected = (signName) => {
    // Standardize sign names for text presentation
    const cleanWord = signName.replace(/\(.*\)/, "").trim();

    if (cleanWord.toUpperCase().includes("SPACE") || cleanWord === " ") {
      // Add active word to sentence list
      if (activeCaption) {
        setSentenceList(prev => [...prev, activeCaption]);
        setActiveCaption("");
      }
    } else if (cleanWord.toUpperCase().includes("DELETE")) {
      // Backspace
      setActiveCaption(prev => prev.slice(0, -1));
    } else {
      // Concat to active word
      setActiveCaption(prev => prev + cleanWord);
      // Trigger voice synthesized playback with a unique timestamp to bypass React caching
      setSpeechPayload({ text: cleanWord, timestamp: Date.now() });
    }
  };

  const clearCaptions = () => {
    setActiveCaption("");
    setSentenceList([]);
    setLastSpokenText("");
  };

  const copyToClipboard = () => {
    const fullSentence = [...sentenceList, activeCaption].filter(Boolean).join(" ");
    if (!fullSentence) return;
    
    navigator.clipboard.writeText(fullSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFullOutput = () => {
    const combined = [...sentenceList, activeCaption].filter(Boolean).join(" ");
    return combined || "Speechless translations will appear here...";
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Top Header Navigation */}
      <header className="app-header">
        <div className="container header-wrap">
          <div className="header-logo">
            <span className="logo-icon">🤟</span>
            <div className="logo-text">
              <h1>
                SignLang
                <span className="badge-mvp">MVP</span>
              </h1>
              <p className="logo-sub">A Product of Kinnova Tech</p>
            </div>
          </div>

          <div>
            <div className="badge-status">
              <span className="status-dot" />
              ISL Engine Activated
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Caption Panel (Top Span) */}
        <div className="glass-card caption-banner">
          <div className="caption-content">
            <span className="caption-label">Live Translation Caption Stream</span>
            <div className={`caption-text ${
              [...sentenceList, activeCaption].filter(Boolean).join(" ") ? "caption-active" : "caption-empty"
            }`}>
              {getFullOutput()}
            </div>
          </div>

          <div className="caption-actions">
            <button onClick={copyToClipboard} className="action-btn">
              {copied ? <Check style={{ width: '16px', height: '16px', color: '#00D4AA' }} /> : <Copy style={{ width: '16px', height: '16px' }} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={clearCaptions} className="action-btn btn-danger">
              <Trash2 style={{ width: '16px', height: '16px' }} />
              Clear
            </button>
          </div>
        </div>

        {/* Dynamic Dual-Column Split Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Live Feed and Audio Synthesis controls */}
          <div className="dashboard-left">
            <HandDetector onLandmarksDetected={(lm) => setLandmarks(lm)} />
            <VoicePlayback payload={speechPayload} />
          </div>

          {/* Right Column: AI Classifier Panel */}
          <div className="dashboard-right">
            <SignClassifier landmarks={landmarks} onSignDetected={handleSignDetected} />

            {/* Quick Tips Card */}
            <div className="glass-card tips-card">
              <h4 className="tips-title">
                <Sparkles style={{ width: '16px', height: '16px', color: '#00D4AA' }} />
                Signing Instructions
              </h4>
              <ul className="tips-list">
                {[
                  "Maintain a clear, well-lit background for camera tracking.",
                  "Raise one hand and showcase gestures within video bounds.",
                  "To trigger a sign, hold the pose for 1.2 seconds.",
                  "The matched text is spoken instantly on your speaker.",
                ].map((tip, idx) => (
                  <li key={idx}>
                    <span>•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="logo-sub" style={{ color: 'var(--text-muted)' }}>
          © 2026 Kinnova Tech. Empowering communication via accessible AI innovations. 🇮🇳
        </p>
      </footer>
    </div>
  );
}
