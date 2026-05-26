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
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Title */}
      <div className="border-b border-white/10 pb-3">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          🔊 Audio Synthesis
        </h4>
      </div>

      {/* Voice Selector Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Feedback Voice Profile
        </label>
        {voices.length > 0 ? (
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full bg-[#0D0D2B]/90 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:border-[#6C3FC5] focus:outline-none transition cursor-pointer"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        ) : (
          <div className="bg-[#0D0D2B]/90 border border-white/5 text-gray-400 rounded-xl p-3 text-xs text-center animate-pulse">
            Loading System Voices...
          </div>
        )}
      </div>

      {/* Volume slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Volume Output
          </label>
          <span className="text-[10px] text-gray-300 font-bold">
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
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D4AA]"
        />
      </div>

      <p className="text-gray-500 text-[10px] text-center leading-normal">
        Synthesized voice outputs are spoken instantly on the recruiter's system for accessible communication.
      </p>
    </div>
  );
}
