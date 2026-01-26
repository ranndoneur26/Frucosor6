"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import BarcodeScanner from "@/components/BarcodeScanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getProductByBarcode } from "@/lib/openfoodfacts";

export default function Home() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { username, remainingAccess, maxWeeklyAccess, logout } = useAuth();
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleBarcodeScan = async (barcode: string) => {
    setShowBarcodeScanner(false);
    setIsSearching(true);

    try {
      const result = await getProductByBarcode(barcode);
      if (result.found && result.product) {
        // Store result and navigate to analysis
        sessionStorage.setItem('barcodeResult', JSON.stringify(result.product));
        router.push('/analysis?fromBarcode=true');
      } else {
        alert(t('barcode.notFound'));
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      alert(t('common.error'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: searchQuery, lang: language }),
      });

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('analysisResult', JSON.stringify(result));
        router.push('/analysis?fromSearch=true');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-black dark:text-white uppercase">FRUCSOR</h1>
          <p className="text-xs text-zinc-500 capitalize">
            {username} • {maxWeeklyAccess === Infinity ? t('login.unlimited') : `${remainingAccess} ${t('login.remaining')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={logout} className="text-zinc-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-symbols-outlined text-background-dark">nutrition</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 grid grid-cols-6 grid-rows-12 gap-3 min-h-[600px]">
        {/* Search */}
        <form onSubmit={handleSearch} className="col-span-6 row-span-2 bg-white dark:bg-[#1a2e21] rounded-xl mondrian-border flex items-center px-4">
          <span className="material-symbols-outlined text-[#9db9a6] mr-3">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-black dark:text-white placeholder-[#9db9a6] w-full font-medium text-lg"
            placeholder={t('home.search')}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
          />
          {isSearching && <span className="material-symbols-outlined animate-spin text-primary">sync</span>}
        </form>

        {/* Scan Label */}
        <div
          onClick={() => router.push('/scan')}
          className="col-span-4 row-span-5 bg-mondrian-red rounded-xl mondrian-border p-5 flex flex-col justify-between group active:scale-95 transition-transform overflow-hidden relative cursor-pointer"
        >
          <div className="z-10 text-white">
            <h2 className="text-3xl font-bold leading-none mb-1 whitespace-pre-line">{t('home.scan.title')}</h2>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{t('home.scan.subtitle')}</p>
          </div>
          <div className="self-end z-10 text-white">
            <span className="material-symbols-outlined text-6xl">photo_camera</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full"></div>
        </div>

        {/* Barcode */}
        <div
          onClick={() => setShowBarcodeScanner(true)}
          className="col-span-2 row-span-2 bg-mondrian-yellow rounded-xl mondrian-border flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-black text-4xl">barcode_scanner</span>
        </div>

        {/* Zero Tolerance */}
        <div className="col-span-2 row-span-3 bg-white dark:bg-zinc-800 rounded-xl mondrian-border p-4 flex flex-col justify-center items-center text-center">
          <span className="text-black dark:text-white font-bold text-xs uppercase tracking-tighter leading-tight whitespace-pre-line">{t('home.zeroTolerance')}</span>
          <div className="mt-2 w-full h-1 bg-primary"></div>
        </div>

        {/* Planner */}
        <div
          onClick={() => router.push('/planner')}
          className="col-span-3 row-span-4 bg-mondrian-blue rounded-xl mondrian-border p-5 flex flex-col justify-between active:scale-95 transition-transform cursor-pointer text-white"
        >
          <span className="material-symbols-outlined text-4xl">calendar_month</span>
          <h3 className="text-xl font-bold leading-tight whitespace-pre-line">{t('home.planner')}</h3>
        </div>

        {/* Languages */}
        <div className="col-span-3 row-span-2 bg-white dark:bg-zinc-200 rounded-xl mondrian-border p-1 flex items-center justify-between text-black overflow-hidden">
          <button
            onClick={() => setLanguage('ca')}
            className={`flex-1 h-full flex items-center justify-center font-bold text-xs rounded transition-colors ${language === 'ca' ? 'bg-black text-white' : 'hover:bg-black/5'}`}
          >
            CAT
          </button>
          <div className="w-[2px] h-1/2 bg-black/10"></div>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 h-full flex items-center justify-center font-bold text-xs rounded transition-colors ${language === 'en' ? 'bg-black text-white' : 'hover:bg-black/5'}`}
          >
            ENG
          </button>
          <div className="w-[2px] h-1/2 bg-black/10"></div>
          <button
            onClick={() => setLanguage('es')}
            className={`flex-1 h-full flex items-center justify-center font-bold text-xs rounded transition-colors ${language === 'es' ? 'bg-black text-white' : 'hover:bg-black/5'}`}
          >
            ESP
          </button>
        </div>

        {/* Safe Profile */}
        <div className="col-span-3 row-span-2 bg-primary rounded-xl mondrian-border p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-background-dark font-bold">check_circle</span>
          <span className="text-background-dark font-extrabold text-sm uppercase whitespace-pre-line">{t('home.safeProfile')}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl overflow-hidden mondrian-border h-24 flex items-end p-3 relative">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKKvxpP2chrMo_VsJOJfvzi0RpL87Fl072WBeBSDB-hpCW2vo47nNNRbASMgok4uoxuoAdQqfxwxBUftIjs9Vu_cWdzahsVx9uchfF_u-6A10b9ouoLHDzl07vas9MFk5Bu84-q-1TL9MV8WFWIKleayP7DzA4biuquqB2bMekLhRWVBxciRs-MQjCyiHdI03K8PErjuReSG1187zeIe-TzOVp0ZfmzCKmjYNaxnW0dknWlHO0qY_-ZYvMLzoPHlql9odkaKjPBc"
            alt="Market Insights"
            fill
            className="object-cover absolute inset-0 z-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-0"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white z-10 relative">{t('home.marketInsights')}</p>
        </div>
      </div>

      <footer className="p-6 text-center">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
          {t('app.by')} <span className="text-zinc-400 dark:text-zinc-300">marcxicola.com</span>
        </p>
      </footer>

      <BottomNav />

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
}
