import React, { useState } from "react";
import HandDetector from "./components/HandDetector";
import SignClassifier from "./components/SignClassifier";
import VoicePlayback from "./components/VoicePlayback";
import { Sparkles, Trash2, Copy, Check } from "lucide-react";

export default function App() {
  const [landmarks, setLandmarks] = useState(null);
  const [activeCaption, setActiveCaption] = useState("");
  const [sentenceList, setSentenceList] = useState([]);
  const [lastSpokenText, setLastSpokenText] = useState("");
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
      // Trigger voice synthesized playback immediately on each character/sign
      setLastSpokenText(cleanWord);
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
    <div className="flex-1 flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white/[0.02] border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]">🤟</span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white m-0 flex items-center gap-2">
                SignLang
                <span className="text-[10px] uppercase font-bold tracking-widest bg-[#6C3FC5]/20 text-[#6C3FC5] border border-[#6C3FC5]/30 px-2 py-0.5 rounded-md">
                  MVP
                </span>
              </h1>
              <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                A Product of Kinnova Tech
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#00D4AA]/10 text-[#00D4AA] text-[10px] font-bold tracking-wider px-3.5 py-1.5 rounded-full border border-[#00D4AA]/20 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              ISL Engine Activated
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        {/* Caption Panel (Top Span) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Live Translation Caption Stream
            </span>
            <div className={`text-lg md:text-xl font-bold tracking-tight transition duration-200 ${
              [...sentenceList, activeCaption].filter(Boolean).join(" ") ? "text-[#00D4AA]" : "text-gray-500"
            }`}>
              {getFullOutput()}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={copyToClipboard}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-[#00D4AA]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={clearCaptions}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Dynamic Dual-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Live Feed and Audio Synthesis controls */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <HandDetector onLandmarksDetected={(lm) => setLandmarks(lm)} />
            <VoicePlayback text={lastSpokenText} />
          </div>

          {/* Right Column: AI Classifier Panel */}
          <div className="flex flex-col gap-6">
            <SignClassifier landmarks={landmarks} onSignDetected={handleSignDetected} />

            {/* Quick Tips Card */}
            <div className="bg-[#6C3FC5]/10 rounded-2xl p-5 border border-[#6C3FC5]/20 backdrop-blur-md">
              <h4 className="text-[#6C3FC5] font-black text-sm flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#00D4AA]" />
                Signing Instructions
              </h4>
              <ul className="space-y-2">
                {[
                  "Maintain a clear, well-lit background for camera tracking.",
                  "Raise one hand and showcase gestures within video bounds.",
                  "To trigger a sign, hold the pose for 1.2 seconds.",
                  "The matched text is spoken instantly on your speaker.",
                ].map((tip, idx) => (
                  <li key={idx} className="text-gray-400 text-xs flex gap-2">
                    <span className="text-[#00D4AA] font-bold">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 bg-black/40 text-center">
        <p className="text-gray-500 text-xs">
          © 2026 Kinnova Tech. Empowering communication via accessible AI innovations. 🇮🇳
        </p>
      </footer>
    </div>
  );
}
