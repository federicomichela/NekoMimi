
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, ContactShadows, Sky } from '@react-three/drei';
import { VoxelCat } from './components/VoxelCat';
import { Overlay } from './components/Overlay';
import { PetAction, PetState } from './types';
import { analyzeGesture } from './services/geminiService';

const VIDEO_WIDTH = 320;
const VIDEO_HEIGHT = 240;
const POLLING_INTERVAL = 1200; // ms

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [petState, setPetState] = useState<PetState>({
    action: PetAction.IDLE,
    mood: "Curious",
    lastUpdate: Date.now(),
    navigation: { x: 0, z: 0 }
  });
  const [reasoning, setReasoning] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuto, setIsAuto] = useState(false);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: VIDEO_WIDTH, 
            height: VIDEO_HEIGHT,
            facingMode: "user" 
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setReasoning("Camera access needed to see gestures!");
      }
    };
    startCamera();
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true);
    
    // Draw frame to canvas
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6); // Compress for speed
        
        // Analyze with Gemini
        const result = await analyzeGesture(base64);
        
        setPetState(prev => ({
            action: result.action,
            mood: result.mood,
            lastUpdate: Date.now(),
            navigation: result.navigation || { x: 0, z: 0 }
        }));
        setReasoning(result.reasoning);
    }
    
    setIsProcessing(false);
  }, [isProcessing]);

  // Polling Effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isAuto) {
      intervalId = setInterval(() => {
        captureAndAnalyze();
      }, POLLING_INTERVAL);
    }
    return () => clearInterval(intervalId);
  }, [isAuto, captureAndAnalyze]);

  return (
    <div className="relative w-full h-screen bg-pink-50">
      
      {/* Hidden Vision Elements */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="fixed bottom-4 right-4 w-32 h-24 rounded-lg border-2 border-white shadow-xl object-cover z-20 opacity-80"
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <canvas ref={canvasRef} width={VIDEO_WIDTH} height={VIDEO_HEIGHT} className="hidden" />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [2, 2, 4], fov: 50 }}>
          <Sky sunPosition={[10, 10, 10]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
          <Stage intensity={0.5} environment="city" adjustCamera={false}>
            <VoxelCat action={petState.action} navigation={petState.navigation} />
          </Stage>
          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="#fbcfe8" />
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={2}
            maxDistance={15}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <Overlay 
        petState={petState} 
        reasoning={reasoning}
        isProcessing={isProcessing}
        isAuto={isAuto}
        onToggleAuto={() => setIsAuto(!isAuto)}
        onManualTrigger={captureAndAnalyze}
      />
      
    </div>
  );
}

export default App;
