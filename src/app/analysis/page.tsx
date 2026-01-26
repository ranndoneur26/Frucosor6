"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalysisResult {
    productName: string;
    fructoseLevel: 'high' | 'moderate' | 'low' | 'none';
    fructoseAmount: string;
    sorbitolLevel: 'high' | 'moderate' | 'low' | 'none';
    sorbitolAmount: string;
    ingredients: Array<{ name: string; risk: 'high' | 'moderate' | 'safe' }>;
    safeAlternative: string;
    warnings: string[];
    overallRisk: 'high' | 'moderate' | 'low' | 'safe';
}

interface BarcodeResult {
    name: string;
    brand: string;
    imageUrl: string;
    ingredients: string;
    sugars: number | null;
    fructose: number | null;
    polyols: number | null;
    fructoseRisk: 'high' | 'moderate' | 'low' | 'unknown';
    sorbitolRisk: 'high' | 'moderate' | 'low' | 'unknown';
    rawIngredients: string[];
}

// Default demo data
const defaultData: AnalysisResult = {
    productName: "Apple Juice Concentrate",
    fructoseLevel: "high",
    fructoseAmount: "12g per 100ml",
    sorbitolLevel: "moderate",
    sorbitolAmount: "2.5g per 100ml",
    ingredients: [
        { name: "Concentrated Apple Juice", risk: "high" },
        { name: "Water", risk: "safe" },
        { name: "Natural Flavors", risk: "moderate" },
        { name: "Ascorbic Acid (Vitamin C)", risk: "safe" },
        { name: "Citric Acid", risk: "safe" },
    ],
    safeAlternative: "Diluted Lemon Water",
    warnings: [],
    overallRisk: "high",
};

export default function Analysis() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const [data, setData] = useState<AnalysisResult>(defaultData);
    const [productImage, setProductImage] = useState<string>("");

    useEffect(() => {
        const fromScan = searchParams.get('fromScan');
        const fromBarcode = searchParams.get('fromBarcode');
        const fromSearch = searchParams.get('fromSearch');

        if (fromScan || fromSearch) {
            const stored = sessionStorage.getItem('analysisResult');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as AnalysisResult;
                    setData(parsed);
                } catch {
                    // Use default data
                }
            }
        } else if (fromBarcode) {
            const stored = sessionStorage.getItem('barcodeResult');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as BarcodeResult;
                    // Convert barcode result to analysis format
                    setData({
                        productName: `${parsed.name} (${parsed.brand})`,
                        fructoseLevel: parsed.fructoseRisk === 'unknown' ? 'moderate' : parsed.fructoseRisk,
                        fructoseAmount: parsed.fructose ? `${parsed.fructose}g per 100g` : (parsed.sugars ? `~${(parsed.sugars / 2).toFixed(1)}g per 100g (estimated)` : 'Unknown'),
                        sorbitolLevel: parsed.sorbitolRisk === 'unknown' ? 'low' : parsed.sorbitolRisk,
                        sorbitolAmount: parsed.polyols ? `${parsed.polyols}g per 100g` : 'Not detected',
                        ingredients: parsed.rawIngredients.slice(0, 5).map(ing => ({
                            name: ing,
                            risk: 'safe' as const,
                        })),
                        safeAlternative: 'Check with your healthcare provider',
                        warnings: [],
                        overallRisk: parsed.fructoseRisk === 'high' || parsed.sorbitolRisk === 'high' ? 'high' : 'moderate',
                    });
                    if (parsed.imageUrl) {
                        setProductImage(parsed.imageUrl);
                    }
                } catch {
                    // Use default data
                }
            }
        }
    }, [searchParams]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'high': return 'bg-warning-red';
            case 'moderate': return 'bg-warning-yellow';
            case 'low': return 'bg-primary';
            case 'none': return 'bg-primary';
            default: return 'bg-zinc-500';
        }
    };

    const getLevelTranslation = (type: 'fructose' | 'sorbitol', level: string) => {
        if (type === 'fructose') {
            switch (level) {
                case 'high': return t('analysis.highFructose');
                case 'moderate': return t('analysis.lowFructose');
                case 'low': return t('analysis.lowFructose');
                case 'none': return t('analysis.noFructose');
                default: return level;
            }
        } else {
            switch (level) {
                case 'high': return t('analysis.moderateSorbitol');
                case 'moderate': return t('analysis.moderateSorbitol');
                case 'low': return t('analysis.lowSorbitol');
                case 'none': return t('analysis.noSorbitol');
                default: return level;
            }
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'bg-warning-red';
            case 'moderate': return 'bg-warning-yellow';
            case 'safe': return 'bg-primary';
            default: return 'bg-zinc-500';
        }
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadReport = async () => {
        if (!data) return;
        setIsDownloading(true);
        try {
            const topic = `Detailed analysis of ${data.productName} for fructose and sorbitol intolerance`;
            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, lang: language }),
            });
            const result = await response.json();
            const blob = new Blob([result.report], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FRUCSOR_Analisi_${data.productName.replace(/\s+/g, '_')}.txt`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24">
            <div className="relative flex flex-col w-full bg-mondrian-black border-b-4 border-black">
                <div className="flex items-center p-4 justify-between bg-background-light dark:bg-background-dark">
                    <button onClick={() => router.back()} className="text-black dark:text-white flex size-12 shrink-0 items-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center uppercase tracking-widest">{t('analysis.title')}</h2>
                    <div className="flex w-12 items-center justify-end">
                        <button className="flex items-center justify-center h-12 bg-transparent text-black dark:text-white">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="p-4 space-y-1">
                <div className="mondrian-border bg-white dark:bg-zinc-900 p-6 mb-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">{t('analysis.productName')}</p>
                    <h1 className="text-black dark:text-white text-4xl font-bold leading-none uppercase break-words">{data.productName}</h1>
                </div>

                <div className="grid grid-cols-12 gap-1">
                    <div className={`col-span-12 mondrian-border ${getLevelColor(data.fructoseLevel)} p-4 flex flex-col justify-between min-h-[140px] mb-1`}>
                        <div>
                            <span className="material-symbols-outlined text-black font-bold text-4xl mb-2">
                                {data.fructoseLevel === 'high' ? 'warning' : data.fructoseLevel === 'moderate' ? 'error' : 'check_circle'}
                            </span>
                            <h2 className="text-black text-3xl font-bold leading-tight uppercase">{getLevelTranslation('fructose', data.fructoseLevel)}</h2>
                        </div>
                        <p className="text-black font-bold text-lg opacity-90">{data.fructoseAmount}</p>
                    </div>

                    <div className={`col-span-12 mondrian-border ${getLevelColor(data.sorbitolLevel)} p-4 flex flex-col justify-between min-h-[140px]`}>
                        <div>
                            <span className="material-symbols-outlined text-black font-bold text-3xl mb-2">
                                {data.sorbitolLevel === 'high' ? 'warning' : data.sorbitolLevel === 'moderate' ? 'error' : 'check_circle'}
                            </span>
                            <h2 className="text-black text-2xl font-bold leading-tight uppercase">{getLevelTranslation('sorbitol', data.sorbitolLevel)}</h2>
                        </div>
                        <p className="text-black font-bold text-lg opacity-90">{data.sorbitolAmount}</p>
                    </div>
                </div>

                {(data.ingredients || []).length > 0 && (
                    <div className="grid grid-cols-12 gap-1 mt-1">
                        <div className="col-span-12 md:col-span-8 mondrian-border bg-white dark:bg-zinc-900 p-4">
                            <h3 className="text-black dark:text-white text-xl font-bold uppercase mb-4 border-b-2 border-black dark:border-white pb-2 inline-block">{t('analysis.ingredients')}</h3>
                            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                                {(data.ingredients || []).map((ingredient, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <span className={`size-3 ${getRiskColor(ingredient.risk)} rounded-full border border-black/20`}></span>
                                        <span className={ingredient.risk !== 'safe' ? 'font-bold text-black dark:text-white' : 'font-medium'}>
                                            {ingredient.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {(data.warnings || []).length > 0 && (
                    <div className="mondrian-border bg-warning-red/20 p-4 mt-1 border-warning-red/40">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-warning-red font-bold">warning</span>
                            <h3 className="text-warning-red font-bold uppercase">{t('analysis.warning')}</h3>
                        </div>
                        <ul className="space-y-1">
                            {(data.warnings || []).map((warning, index) => (
                                <li key={index} className="text-sm text-zinc-800 dark:text-zinc-200 font-bold">• {warning}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mondrian-border bg-primary p-4 flex items-center justify-between mt-1">
                    <div>
                        <p className="text-black text-xs font-bold uppercase">{t('analysis.safeAlternative')}</p>
                        <p className="text-black text-xl font-bold">{data.safeAlternative}</p>
                    </div>
                    <span className="material-symbols-outlined text-black font-bold text-4xl">check_circle</span>
                </div>

                <div className="mondrian-border overflow-hidden h-48 relative mt-1">
                    <Image
                        src={productImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAU9BfFZUCG00W63QHxnjqYVoxHh0vWifIMRnrH5AgGlgJsqoG8V031FLnDNk9Gr4CYjY7menlFbpg3RgaBtRQnl3jHh-clBNZeFchlgA7_yEayPWWKDxYDJAS1NAsxUCHndxaluNAr7kL-nKcW6-1bsAw5Z3vZX8AYerHerYOJ6cNN9shYUWclKhk_NU94Uxxn0fl6OnrALiHGNuCEr0LQSA8LdIJ88gNu0R3PyejKvTDrKEpr9sWXy6bCJmfasKq3ADkBUjJFt9E"}
                        alt="Product Image"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 z-10"></div>
                </div>

                <div className="py-4">
                    <button
                        onClick={handleDownloadReport}
                        disabled={isDownloading}
                        className="w-full mondrian-border bg-black text-white h-16 flex items-center justify-center gap-3 font-bold text-xl uppercase tracking-tighter hover:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin font-bold">sync</span>
                                {t('common.loading')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined font-bold text-primary">download</span>
                                {t('analysis.download')} (.TXT)
                            </>
                        )}
                    </button>
                </div>
            </main>

            <footer className="p-8 text-center">
                <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">
                    {t('app.by')} <a className="text-primary hover:underline" href="https://marcxicola.com">marcxicola.com</a>
                </p>
            </footer>
            <BottomNav />
        </div>
    );
}
