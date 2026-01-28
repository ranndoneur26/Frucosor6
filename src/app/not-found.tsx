"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
            <div className="mondrian-border bg-white dark:bg-zinc-900 p-8 rounded-xl max-w-md w-full text-center">
                <h2 className="text-6xl font-bold text-mondrian-red mb-4">404</h2>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{t('error.404.title')}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    {t('error.404.message')}
                </p>
                <Link
                    href="/"
                    className="inline-block bg-black text-white px-6 py-3 rounded uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors"
                >
                    {t('error.return')}
                </Link>
            </div>
            <div className="mt-8 text-xs text-zinc-500 uppercase tracking-widest">
                FRUCSOR Secure System
            </div>
        </div>
    );
}
