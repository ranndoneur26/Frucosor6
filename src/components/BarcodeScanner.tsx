"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '@/contexts/LanguageContext';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
    const { t } = useLanguage();
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mounted = true;
        let isScanning = false;

        const startScanner = async () => {
            if (!containerRef.current) return;

            try {
                const scanner = new Html5Qrcode('barcode-reader');
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 150 },
                    },
                    (decodedText) => {
                        if (mounted && isScanning) {
                            isScanning = false;
                            // Stop scanning and return result
                            scanner.stop().then(() => {
                                onScan(decodedText);
                            }).catch(console.error);
                        }
                    },
                    () => {
                        // Ignore scan errors (no code found)
                    }
                );
                isScanning = true;
            } catch (err) {
                console.error('Scanner error:', err);
                if (mounted) {
                    setError('Could not access camera. Please check permissions.');
                }
            }
        };

        startScanner();

        return () => {
            mounted = false;
            if (scannerRef.current && isScanning) {
                isScanning = false;
                scannerRef.current.stop().catch((err) => {
                    // Ignore errors when stopping scanner during cleanup
                    console.log('Scanner cleanup:', err);
                });
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-md">
                <button onClick={onClose} className="text-white flex items-center gap-2">
                    <span className="material-symbols-outlined">close</span>
                    <span className="font-medium">{t('common.close')}</span>
                </button>
                <h2 className="text-white font-bold uppercase tracking-widest text-sm">{t('barcode.title')}</h2>
                <div className="w-16"></div>
            </div>

            {/* Scanner */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div
                    id="barcode-reader"
                    ref={containerRef}
                    className="w-full max-w-md overflow-hidden rounded-xl"
                ></div>

                {error ? (
                    <div className="mt-4 bg-warning-red/20 text-warning-red p-4 rounded-xl text-center">
                        <span className="material-symbols-outlined text-3xl mb-2">error</span>
                        <p>{error}</p>
                    </div>
                ) : (
                    <p className="mt-4 text-zinc-400 text-center text-sm">
                        {t('barcode.instructions')}
                    </p>
                )}
            </div>

            {/* Decorative corners */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-48 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
