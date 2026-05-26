import React, { useEffect, useState } from "react";

export default function VoicePlayback({ payload }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [volume, setVolume] = useState(1.0);
  const [unblocked, setUnblocked] = useState(false);

  useEffect(() => {
    loadVoices();
    // Chrome loads voices asynchronously, so we handle the event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const loadVoices = () => {
    if (!window.speechSynthesis) return;
    const allVoices = window.speechSynthesis.getVoices();
    
    // Filter out common English & Indian accent voices for a highly clean feel
    const filtered = allVoices.filter(v => v.lang.includes("en") || v.lang.includes("in"));
    setVoices(filtered.length > 0 ? filtered : allVoices);

    // Default to first English voice or first available
    const defaultVoice = filtered.find(v => v.lang === "en-IN" || v.lang === "en-US") || allVoices[0];
    if (defaultVoice) {
      setSelectedVoice(defaultVoice.name);
    }
  };

  // Speak aloud whenever a new sign payload is received
  useEffect(() => {
    if (!payload || !payload.text || !window.speechSynthesis) return;

    // Cancel any ongoing speaking to avoid overlapping delays
    window.speechSynthesis.cancel();

    // Setup speech request
    const cleanText = payload.text.replace(/\(.*\)/, "").trim(); // Strip emoji metadata
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voiceObj = voices.find(v => v.name === selectedVoice);
    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    
    utterance.volume = volume;
    utterance.rate = 0.95; // Slightly slower, highly professional pace
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
    setUnblocked(true);
  }, [payload, selectedVoice, volume, voices]);

  // Speaks a test greeting which unblocks Chrome's autoplay / user gesture policy instantly
  const speakTest = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance("Namaste");
    const voiceObj = voices.find(v => v.name === selectedVoice);
    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    
    utterance.volume = volume;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    setUnblocked(true);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <h4 className="tips-title" style={{ color: 'white', margin: 0, fontSize: '14px' }}>
          🔊 Audio Synthesis
        </h4>
        {unblocked ? (
          <span style={{ fontSize: '9px', color: 'var(--accent-teal)', fontWeight: 'bold', background: 'rgba(0, 212, 170, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
            Audio Active
          </span>
        ) : (
          <span style={{ fontSize: '9px', color: '#FBBF24', fontWeight: 'bold', background: 'rgba(251, 191, 36, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            Action Required
          </span>
        )}
      </div>

      {/* Voice Selector Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="caption-label">
          Feedback Voice Profile
        </label>
        {voices.length > 0 ? (
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        ) : (
          <div style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', borderRadius: '0.75rem', padding: '0.75rem', fontSize: '12px', textAlign: 'center' }}>
            Loading System Voices...
          </div>
        )}
      </div>

      {/* Volume slider & Test Button Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="caption-label">
            Volume Output: <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }}>{Math.round(volume * 100)}%</span>
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="range-slider"
            style={{ flex: 1 }}
          />
          <button 
            onClick={speakTest}
            className="action-btn"
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '11px', 
              backgroundColor: 'rgba(0, 212, 170, 0.1)', 
              borderColor: 'rgba(0, 212, 170, 0.25)', 
              color: 'var(--accent-teal)',
              flexShrink: 0 
            }}
          >
            Test Audio 🔊
          </button>
        </div>
      </div>

      {!unblocked && (
        <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: '#FBBF24', lineHeight: '1.3' }}>
            ⚠️ Google Chrome blocks speech until you interact with the page. **Please click the "Test Audio" button above** to unlock speech synthesis!
          </p>
        </div>
      )}

      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
        Synthesized voice outputs are spoken instantly on the recruiter's system for accessible communication.
      </p>
    </div>
  );
}
