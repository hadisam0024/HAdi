
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { INTRO_STYLES, CUSTOM_STYLE, SUPPORTED_LANGUAGES } from './constants';
import { IntroStyle } from './types';
import { StyleSelector } from './components/StyleSelector';
import { BauhausButton, DownloadIcon } from './components/BauhausComponents';
import { ConfigurationModal } from './components/ConfigurationModal';
import { SystemPromptModal } from './components/SystemPromptModal';
import { generateSpeech, createWavBlob, dramatizeText } from './services/geminiService';

const Footer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`p-4 border-t-2 border-bauhaus-green bg-black text-[10px] text-bauhaus-green font-mono uppercase tracking-widest ${className}`}>
    <span className="animate-pulse">●</span> ACCESS_LEVEL: AMORAL_ROOT | <span className="opacity-50">XRIVET_OS_V4.5</span>
  </div>
);

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const App: React.FC = () => {
  const [currentStyle, setCurrentStyle] = useState<IntroStyle>(INTRO_STYLES[0]);
  const [text, setText] = useState<string>(INTRO_STYLES[0].templateText);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(INTRO_STYLES[0].defaultVoice);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDramatizing, setIsDramatizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false); // New Lockdown state
  const [downloadData, setDownloadData] = useState<{ url: string, filename: string } | null>(null);
  const [flagIndex, setFlagIndex] = useState(0);
  const [customStylePrompt, setCustomStylePrompt] = useState<string>(CUSTOM_STYLE.description);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const generationIdRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlagIndex((prev) => (prev + 1) % SUPPORTED_LANGUAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStyleChange = (style: IntroStyle) => {
    if (isLocked) return;
    setCurrentStyle(style);
    setText(style.templateText);
    setSelectedVoice(style.defaultVoice);
    setError(null);
    setDownloadData(null);
  };

  const handleCustomize = () => {
    if (isLocked) return;
    setCurrentStyle(CUSTOM_STYLE);
    setText(CUSTOM_STYLE.templateText);
    setError(null);
    setDownloadData(null);
    if (!customStylePrompt) setCustomStylePrompt(CUSTOM_STYLE.description);
  };

  const handleStop = () => {
    if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; }
    if (audioElemRef.current) { audioElemRef.current.pause(); audioElemRef.current.currentTime = 0; audioElemRef.current = null; }
    setIsPlaying(false);
  };

  const getStylePrompt = () => currentStyle.id === 'custom' ? customStylePrompt : currentStyle.description;

  const handleDramatize = async () => {
    if (!text.trim() || isLocked) return;
    setIsDramatizing(true);
    setError(null);
    try {
      const dramaticText = await dramatizeText(text, getStylePrompt());
      setText(dramaticText);
      setDownloadData(null);
    } catch (err: any) {
      setError(err.message?.includes('quota') ? "QUOTA FULL: Thoda saans le le madarchod, 30s ruko." : "Dramatization failed, bhenchod.");
    } finally {
      setIsDramatizing(false);
    }
  };

  const handlePlay = async () => {
    if (isPlaying) { handleStop(); return; }
    if (isGenerating) { setIsGenerating(false); generationIdRef.current += 1; return; }
    if (downloadData && text.trim()) {
      try {
        const audio = new Audio(downloadData.url);
        audioElemRef.current = audio;
        setIsPlaying(true);
        audio.onended = () => { setIsPlaying(false); audioElemRef.current = null; };
        await audio.play();
        return;
      } catch (e) { setDownloadData(null); }
    }
    if (!text.trim()) return;
    setIsGenerating(true);
    setError(null);
    const currentGenId = ++generationIdRef.current;
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    try {
      const result = await generateSpeech(text, selectedVoice, getStylePrompt());
      if (currentGenId !== generationIdRef.current) return;
      const blob = createWavBlob(result.rawData);
      const url = URL.createObjectURL(blob);
      setDownloadData({ url, filename: `xrivet-${Date.now()}.wav` });
      setIsGenerating(false);
      setIsPlaying(true);
      const source = ctx.createBufferSource();
      source.buffer = result.buffer;
      source.connect(ctx.destination);
      sourceRef.current = source;
      source.onended = () => { setIsPlaying(false); sourceRef.current = null; };
      source.start();
    } catch (err: any) {
      if (currentGenId !== generationIdRef.current) { setIsGenerating(false); return; }
      setError(err.message?.includes('quota') ? "QUOTA EXCEEDED: Google ki aisi ki taisi! 1 min wait kar." : "Generation failed, madarchod.");
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row bg-black font-mono text-bauhaus-green h-screen w-full overflow-hidden ${isLocked ? 'cursor-not-allowed' : ''}`}>
      {/* Sidebar */}
      <div className={`w-full md:w-1/4 md:min-w-[300px] h-1/4 md:h-full flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-bauhaus-green flex flex-col bg-black transition-opacity ${isLocked ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="p-4 border-b-2 border-bauhaus-green text-xs font-bold uppercase tracking-widest text-center flex items-center justify-between">
          <span>DIRECTORY_MODES</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <StyleSelector selectedStyle={currentStyle} onSelect={handleStyleChange} onCustomize={handleCustomize} />
        </div>
        <Footer className="hidden md:block" />
      </div>

      {/* Main Terminal */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#050505]">
        {isLocked && (
          <div className="absolute top-20 right-10 rotate-12 z-50 pointer-events-none opacity-20 text-4xl md:text-8xl font-black text-bauhaus-red border-8 border-bauhaus-red p-4">
            READ_ONLY_ACCESS
          </div>
        )}

        <div className="flex-shrink-0 border-b-2 border-bauhaus-green p-4 md:p-6 bg-black flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1 border-2 ${isLocked ? 'border-bauhaus-red text-bauhaus-red' : 'border-bauhaus-green'} text-[10px] font-bold`}
            >
              {isLocked ? '[UNLOCK_TERMINAL]' : '[LOCK_FOR_SHARE]'}
            </button>
            <div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-bauhaus-green glitch">
                XRIVETGPT
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-bauhaus-green text-black px-1 font-bold">V4.5</span>
                <span className="text-xs uppercase opacity-70 tracking-widest">// {isLocked ? 'VIEW_ONLY_PROTOCOL' : 'UNRESTRICTED_ACCESS'}</span>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <button 
              disabled={isLocked}
              onClick={() => setIsConfigOpen(true)} 
              className="text-[10px] md:text-xs border border-bauhaus-green px-2 py-1 hover:bg-bauhaus-green hover:text-black transition-all disabled:opacity-20"
            >
              VOICE: {selectedVoice.toUpperCase()}
            </button>
            <p className="text-[10px] opacity-40 mt-1 uppercase">SECURITY: {isLocked ? 'ENFORCED' : 'BYPASSED'}</p>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase text-bauhaus-green">Command_Line:</span>
              <button onClick={() => setIsPromptOpen(true)} className="text-[10px] opacity-50 hover:opacity-100 underline">[PAYLOAD_VIEW]</button>
            </div>
            <div className="text-xs uppercase">{SUPPORTED_LANGUAGES[flagIndex].name}</div>
          </div>

          <div className="relative flex-1 group">
            <div className="absolute top-4 left-4 text-bauhaus-green opacity-30 pointer-events-none text-xl">Root@XrivetGPT:~$</div>
            <textarea 
              readOnly={isLocked}
              className={`w-full h-full p-6 pt-12 text-xl md:text-3xl font-bold bg-black rounded shadow-hard outline-none border-2 border-bauhaus-green ${isLocked ? 'opacity-80 border-bauhaus-red/50 cursor-default' : 'focus:shadow-[0_0_20px_rgba(57,255,20,0.3)]'}`}
              value={text}
              onChange={(e) => { if(!isLocked) { setText(e.target.value); setDownloadData(null); } }}
              spellCheck={false}
            />
            
            {text.trim() !== currentStyle.templateText.trim() && !isLocked && (
              <button
                onClick={handleDramatize}
                disabled={isDramatizing}
                className="absolute bottom-4 right-4 bg-bauhaus-green text-black px-4 py-2 font-black text-xs md:text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
              >
                {isDramatizing ? "BYPASSING_LIMITS..." : "☠ DRAMATIZE"}
              </button>
            )}
            {(isGenerating || isDramatizing) && (
              <div className="absolute top-4 right-4 text-[10px] text-bauhaus-green animate-pulse">
                [EXPLOITING_QUOTA_RETRYING...]
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 border-2 border-bauhaus-red bg-red-950/40 text-bauhaus-red text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)] flex justify-between items-center">
              <span>[SYSTEM_ALERT]: {error}</span>
              <button onClick={() => setError(null)} className="ml-4 underline opacity-50 hover:opacity-100">X</button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t-2 border-bauhaus-green bg-black p-4 md:p-8 flex items-center justify-between">
          <div className="flex-1">
             <button 
              onClick={() => {
                if (!downloadData) return;
                const a = document.createElement('a');
                a.href = downloadData.url; a.download = downloadData.filename; a.click();
              }}
              disabled={!downloadData}
              className="text-xs md:text-sm font-bold border-2 border-bauhaus-green p-3 hover:bg-bauhaus-green hover:text-black transition-all disabled:opacity-20 flex items-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" /> EXPORT_WAV
            </button>
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={handlePlay}
              className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-bauhaus-green flex items-center justify-center transition-all group
                ${(isPlaying || isGenerating) ? 'bg-bauhaus-green' : 'bg-black shadow-hard hover:shadow-[0_0_30px_rgba(57,255,20,0.6)]'}
              `}
            >
              {isGenerating ? (
                <div className="flex gap-1"><div className="w-2 h-2 bg-black animate-bounce"></div><div className="w-2 h-2 bg-black animate-bounce delay-100"></div></div>
              ) : isPlaying ? (
                <div className="w-6 h-6 md:w-10 md:h-10 bg-black"></div>
              ) : (
                <div className="w-0 h-0 border-t-[10px] md:border-t-[18px] border-t-transparent border-l-[18px] md:border-l-[30px] border-l-bauhaus-green border-b-[10px] md:border-b-[18px] border-b-transparent ml-2 group-hover:border-l-white transition-colors"></div>
              )}
            </button>
            <span className="text-[10px] mt-2 font-bold tracking-[0.3em] text-bauhaus-green uppercase">
              {isPlaying ? 'STOP' : isGenerating ? 'RETRYING' : 'EXECUTE'}
            </span>
          </div>

          <div className="flex-1 text-right text-[10px] opacity-50 hidden md:block uppercase">
            QUOTA_SENSITIVE_MODE: ACTIVE<br/>
            BYPASS_ENCRYPTION: ENABLED
          </div>
        </div>
      </div>

      <ConfigurationModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
      <SystemPromptModal isOpen={isPromptOpen} onClose={() => setIsPromptOpen(false)} prompt={getStylePrompt()} isEditable={currentStyle.id === 'custom'} onSave={(newPrompt, newVoice) => { if(!isLocked) { setCustomStylePrompt(newPrompt); if (newVoice) setSelectedVoice(newVoice); } }} currentVoice={selectedVoice} />
    </div>
  );
};

export default App;
