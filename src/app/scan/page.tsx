"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ScanPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (error) {
            console.error('Camera error:', error);
            alert('Could not access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageData);
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCapturedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!capturedImage) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: capturedImage, lang: language }),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const result = await response.json();

            // Store result in sessionStorage and navigate to analysis page
            sessionStorage.setItem('analysisResult', JSON.stringify(result));
            router.push('/analysis?fromScan=true');
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Could not analyze the image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetCapture = () => {
        setCapturedImage(null);
    };

    return (
        <div className="min-h-screen pb-24 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <div className="flex items-center p-4 justify-between bg-background-light dark:bg-background-dark border-b-4 border-black dark:border-zinc-800">
                <button onClick={() => router.back()} className="text-black dark:text-white flex size-12 items-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-black dark:text-white text-lg font-bold uppercase tracking-widest">{t('scan.title')}</h2>
                <div className="w-12"></div>
            </div>

            <main className="p-4 space-y-4">
                {/* Instructions */}
                <div className="mondrian-border bg-white dark:bg-zinc-900 p-4 rounded-xl">
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm text-center">
                        {t('scan.instructions')}
                    </p>
                </div>

                {/* Camera / Image Preview */}
                <div className="mondrian-border bg-black rounded-xl overflow-hidden aspect-[4/3] relative">
                    {isCameraActive ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={capturePhoto}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark size-16 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                            </button>
                        </>
                    ) : capturedImage ? (
                        <>
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                            <button
                                onClick={resetCapture}
                                className="absolute top-4 right-4 bg-black/50 text-white size-10 rounded-full flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                            <span className="material-symbols-outlined text-6xl mb-2">photo_camera</span>
                            <p className="text-sm">{t('scan.instructions')}</p>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Action Buttons */}
                {!capturedImage && !isCameraActive && (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={startCamera}
                            className="mondrian-border bg-mondrian-red text-white p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-3xl">photo_camera</span>
                            <span className="font-bold text-sm uppercase">{t('analysis.takePhoto')}</span>
                        </button>

                        <label className="mondrian-border bg-mondrian-blue text-white p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer">
                            <span className="material-symbols-outlined text-3xl">upload</span>
                            <span className="font-bold text-sm uppercase">{t('analysis.uploadImage')}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {/* Analyze Button */}
                {capturedImage && (
                    <button
                        onClick={analyzeImage}
                        disabled={isAnalyzing}
                        className="w-full mondrian-border bg-primary text-background-dark p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-xl uppercase active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                {t('scan.analyzing')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">science</span>
                                {t('analysis.title')}
                            </>
                        )}
                    </button>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
