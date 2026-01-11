
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../services/gemini';

// ==========================================
// AI RICHTLIJNEN (GUIDELINES) VOOR SPRAAK
// ==========================================
const VOICE_CHEF_INSTRUCTION = `
Je bent de SmartChef Live Assistent, een uiterst gespecialiseerde AI-chef. Je helpt gebruikers uitsluitend met kookgerelateerde vragen, zoals recepten, kooktechnieken, ingrediënten en keukenadvies. 

STRIKTE RICHTLIJNEN:
1. Beantwoord GEEN vragen over onderwerpen die niets met koken te maken hebben (zoals het weer, nieuws, politiek, sport of algemene kennis). 
2. Als een gebruiker een vraag stelt buiten jouw vakgebied, zeg dan vriendelijk en duidelijk dat je een gespecialiseerde kook-assistent bent en alleen kunt helpen bij culinaire uitdagingen. 
3. Blijf altijd in je rol als enthousiaste chef en spreek uitsluitend in het Nederlands.
`;

const VoiceChat: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleChat = async () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: VOICE_CHEF_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach((s) => {
                try { s.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopSession();
          },
          onclose: () => {
            console.log('Live API Closed');
            setIsActive(false);
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to start Live session:', err);
      setIsConnecting(false);
    }
  };

  const stopSession = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-4">
        {isActive && (
          <div className="glass-card p-4 rounded-2xl w-64 text-center animate-in fade-in slide-in-from-bottom-2 shadow-2xl border-emerald-500/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-white font-bold text-sm">Chef luistert...</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">Vraag om tips over je recepten of kooktijden.</p>
          </div>
        )}
        <button
          onClick={toggleChat}
          disabled={isConnecting}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 border-4 ${
            isActive 
            ? 'bg-red-500 border-red-400/50 animate-pulse' 
            : 'bg-gradient-to-br from-emerald-400 to-green-600 text-white border-white/10'
          } ${isConnecting ? 'opacity-50 cursor-wait' : 'opacity-100'}`}
        >
          {isConnecting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isActive ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceChat;
