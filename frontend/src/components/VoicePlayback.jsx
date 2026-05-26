import React, { useEffect, useState } from "react";

export default function VoicePlayback({ text }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [volume, setVolume] = useState(1.0);

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

  // Speak aloud whenever a new sign text is passed in
  useEffect(() => {
    if (!text || !window.speechSynthesis) return;

    // Cancel any ongoing speaking to avoid overlapping delays
    window.speechSynthesis.cancel();

    // Setup speech request
    const cleanText = text.replace(/\(.*\)/, "").trim(); // Strip emoji metadata
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voiceObj = voices.find(v => v.name === selectedVoice);
    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    
    utterance.volume = volume;
    utterance.rate = 0.95; // Slightly slower, highly professional pace
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }, [text, selectedVoice, volume, voices]);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <h4 className="tips-title" style={{ color: 'white', margin: 0, fontSize: '14px' }}>
          🔊 Audio Synthesis
        </h4>
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

      {/* Volume slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="caption-label">
            Volume Output
          </label>
          <span style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="range-slider"
        />
      </div>

      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
        Synthesized voice outputs are spoken instantly on the recruiter's system for accessible communication.
      </p>
    </div>
  );
}
