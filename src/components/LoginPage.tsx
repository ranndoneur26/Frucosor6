"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const result = login(username, password);
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-light dark:bg-background-dark">
            {/* Language Selector */}
            <div className="absolute top-6 right-6 bg-white dark:bg-zinc-800 rounded-xl mondrian-border p-1 flex items-center text-black overflow-hidden">
                <button
                    onClick={() => setLanguage('ca')}
                    className={`px-3 py-2 font-bold text-xs rounded transition-colors ${language === 'ca' ? 'bg-black text-white' : 'hover:bg-black/5 dark:text-white dark:hover:bg-white/10'}`}
                >
                    CAT
                </button>
                <div className="w-[2px] h-4 bg-black/10 dark:bg-white/10"></div>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-2 font-bold text-xs rounded transition-colors ${language === 'en' ? 'bg-black text-white' : 'hover:bg-black/5 dark:text-white dark:hover:bg-white/10'}`}
                >
                    ENG
                </button>
                <div className="w-[2px] h-4 bg-black/10 dark:bg-white/10"></div>
                <button
                    onClick={() => setLanguage('es')}
                    className={`px-3 py-2 font-bold text-xs rounded transition-colors ${language === 'es' ? 'bg-black text-white' : 'hover:bg-black/5 dark:text-white dark:hover:bg-white/10'}`}
                >
                    ESP
                </button>
            </div>

            {/* Logo */}
            <div className="mb-8 text-center">
                <div className="bg-primary p-4 rounded-2xl inline-block mb-4">
                    <span className="material-symbols-outlined text-background-dark text-5xl">nutrition</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-black dark:text-white uppercase">FRUCSOR</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('app.subtitle')}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div className="mondrian-border bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-black dark:text-white uppercase tracking-tight text-center mb-6">
                        {t('login.title')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            {t('login.username')}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-primary rounded-lg px-4 py-3 text-black dark:text-white font-medium transition-colors"
                            placeholder="Ignasi / Xicola"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                            {t('login.password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-2 border-transparent focus:border-primary rounded-lg px-4 py-3 text-black dark:text-white font-medium transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-warning-red/10 border-2 border-warning-red rounded-lg p-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-warning-red">error</span>
                            <p className="text-warning-red text-sm font-medium">{t(error)}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-background-dark font-bold text-lg uppercase tracking-tight py-4 rounded-lg hover:scale-[0.98] active:scale-95 transition-transform"
                    >
                        {t('login.submit')}
                    </button>
                </div>
            </form>

            {/* Footer */}
            <footer className="absolute bottom-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                    {t('app.by')} <span className="text-zinc-400 dark:text-zinc-300">marcxicola.com</span>
                </p>
            </footer>
        </div>
    );
};

export default LoginPage;
