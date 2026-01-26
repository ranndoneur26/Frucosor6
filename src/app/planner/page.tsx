"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";

interface Meal {
    name: string;
    description: string;
    ingredients: string[];
    safe: boolean;
}

interface DayMenu {
    day: string;
    meals: {
        breakfast: Meal;
        lunch: Meal;
        snack: Meal;
        dinner: Meal;
    };
}

interface MenuPlan {
    title: string;
    days: DayMenu[];
    notes: string[];
}

export default function Planner() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [userRequest, setUserRequest] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userRequest.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userRequest, lang: language }),
            });

            if (!response.ok) throw new Error('Failed to generate menu');

            const data = await response.json();
            setMenuPlan(data);
        } catch (err) {
            console.error('Menu generation error:', err);
            setError('No se pudo generar el menú. Por favor, intenta de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadReport = async () => {
        if (!menuPlan) return;
        setIsDownloading(true);
        try {
            const topic = `Menu Plan for ${menuPlan.title}`;
            const response = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: menuPlan, lang: language }),
            });
            const data = await response.json();
            const blob = new Blob([data.report], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FRUCSOR_Plan_${menuPlan.title.replace(/\s+/g, '_')}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case 'breakfast': return 'egg';
            case 'lunch': return 'restaurant';
            case 'snack': return 'cookie';
            case 'dinner': return 'dinner_dining';
            default: return 'restaurant';
        }
    };

    const getMealLabel = (mealType: string) => {
        switch (mealType) {
            case 'breakfast': return t('planner.breakfast');
            case 'lunch': return t('planner.lunch');
            case 'snack': return t('planner.snack');
            case 'dinner': return t('planner.dinner');
            default: return mealType;
        }
    };

    const suggestions = [
        t('planner.fructoseSafe'),
        t('planner.sorbitolFree'),
        t('planner.tailored')
    ];

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <button
                        onClick={() => router.back()}
                        className="text-black dark:text-white flex size-12 shrink-0 items-center"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display">
                        {t('planner.title')}
                    </h2>
                    <div className="w-12"></div>
                </div>
            </header>

            <main className="p-4">
                {/* Input Form */}
                {!menuPlan && (
                    <div className="space-y-4">
                        <div className="mondrian-border bg-white dark:bg-zinc-900 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary p-3 rounded-lg">
                                    <span className="material-symbols-outlined text-background-dark text-2xl">restaurant_menu</span>
                                </div>
                                <div>
                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold">
                                        {t('planner.yourMenu')}
                                    </h3>
                                    <p className="text-slate-500 dark:text-primary text-sm font-bold opacity-80">
                                        {t('planner.tailored')}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleGenerateMenu} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                        {t('planner.ideal')}
                                    </label>
                                    <textarea
                                        value={userRequest}
                                        onChange={(e) => setUserRequest(e.target.value)}
                                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-primary rounded-lg px-4 py-3 text-black dark:text-white font-medium transition-colors min-h-[120px] resize-none"
                                        placeholder={t('planner.example')}
                                        required
                                        disabled={isGenerating}
                                    />
                                    <p className="text-xs text-zinc-500 mt-2">
                                        {t('planner.tip')}
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-warning-red/10 border-2 border-warning-red rounded-lg p-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-warning-red">error</span>
                                        <p className="text-warning-red text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isGenerating || !userRequest.trim()}
                                    className="w-full mondrian-border bg-primary text-background-dark font-bold text-lg uppercase tracking-tight py-4 rounded-lg hover:scale-[0.98] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">sync</span>
                                            {t('planner.generating')}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">auto_awesome</span>
                                            {t('planner.generate')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Example suggestions */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                {t('planner.suggestions')}
                            </p>
                            {[
                                t('planner.fructoseSafe'),
                                t('planner.sorbitolFree'),
                                t('planner.tailored')
                            ].map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setUserRequest(suggestion)}
                                    className="w-full text-left px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-lg hover:bg-primary/10 transition-colors"
                                >
                                    <p className="text-sm text-slate-900 dark:text-white font-bold">
                                        {suggestion}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Menu Results */}
                {menuPlan && (
                    <div className="space-y-4">
                        {/* Title and Reset */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-slate-900 dark:text-white text-2xl font-bold">
                                    {menuPlan.title}
                                </h3>
                                <p className="text-slate-500 dark:text-primary text-sm font-bold">
                                    {t('planner.generatedByAI')}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setMenuPlan(null);
                                    setUserRequest("");
                                }}
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                <span className="material-symbols-outlined">refresh</span>
                            </button>
                        </div>

                        <button
                            onClick={handleDownloadReport}
                            disabled={isDownloading}
                            className="w-full mondrian-border bg-black text-white p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                    {t('common.loading')}
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">download</span>
                                    Descarregar Informe Professional (.TXT)
                                </>
                            )}
                        </button>

                        {/* Days */}
                        {menuPlan.days.map((dayMenu, dayIndex) => (
                            <div key={dayIndex} className="space-y-3">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight border-b-2 border-primary pb-2 inline-block">
                                    {dayMenu.day}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(dayMenu.meals).map(([mealType, meal]) => (
                                        <div
                                            key={mealType}
                                            className="mondrian-border bg-white dark:bg-zinc-900 p-4 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="bg-primary p-2 rounded-lg">
                                                    <span className="material-symbols-outlined text-white font-bold">
                                                        {getMealIcon(mealType)}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                                        {getMealLabel(mealType)}
                                                    </p>
                                                    <h5 className="text-black dark:text-white font-bold">
                                                        {meal.name}
                                                    </h5>
                                                </div>
                                                {meal.safe && (
                                                    <span className="material-symbols-outlined text-primary font-bold text-xl">
                                                        check_circle
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-3">
                                                {meal.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {meal.ingredients.map((ingredient, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs bg-primary/10 text-primary border border-primary/30 font-bold px-2 py-1 rounded-full"
                                                    >
                                                        {ingredient}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Notes */}
                        {menuPlan.notes && menuPlan.notes.length > 0 && (
                            <div className="mondrian-border bg-primary/10 p-4 rounded-xl border-primary/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary font-bold">info</span>
                                    <h5 className="font-bold text-black dark:text-white uppercase text-sm">
                                        {t('planner.importantNotes')}
                                    </h5>
                                </div>
                                <ul className="space-y-1">
                                    {menuPlan.notes.map((note, idx) => (
                                        <li key={idx} className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                            • {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
