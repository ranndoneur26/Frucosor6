"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t-4 border-black dark:border-zinc-800 bg-white dark:bg-background-dark px-8 py-4 flex justify-between items-center z-50">
            <button
                onClick={() => router.push('/')}
                className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-zinc-400'}`}
            >
                <span className="material-symbols-outlined font-bold">home</span>
                <span className="text-[10px] font-medium uppercase">{t('nav.home')}</span>
            </button>

            <button
                onClick={() => router.push('/planner')}
                className={`flex flex-col items-center gap-1 ${isActive('/planner') ? 'text-primary' : 'text-zinc-400'}`}
            >
                <span className="material-symbols-outlined">calendar_month</span>
                <span className="text-[10px] font-medium uppercase">{t('nav.planner')}</span>
            </button>
        </div>
    );
};

export default BottomNav;
