import React, { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WhatWeBuildSection from './components/WhatWeBuildSection';
import HowWeThinkSection from './components/HowWeThinkSection';
import ExperienceSection from './components/ExperienceSection';
import SelectedWorkSection from './components/SelectedWorkSection';
import HowWeBuildSection from './components/HowWeBuildSection';
import IndustriesSection from './components/IndustriesSection';
import WhyLumiSection from './components/WhyLumiSection';
import CompanyStorySection from './components/CompanyStorySection';
import FinalCTASection from './components/FinalCTASection';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import ScrollProgress from './components/ScrollProgress';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const handleIntroComplete = useCallback(() => setLoading(false), []);
  const replayIntro = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIntroKey((k) => k + 1);
    setLoading(true);
  }, []);

  // Recalculate scroll-triggered reveals once the intro overlay has been removed
  useEffect(() => {
    if (loading) return undefined;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [loading]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-black text-white">
      {loading && <LoadingScreen key={introKey} onComplete={handleIntroComplete} />}

      {!loading && <ScrollProgress />}
      <Navbar onOpenContact={openContact} onReplayIntro={replayIntro} />

      <main className="relative z-10">
        <HeroSection onOpenContact={openContact} introDone={!loading} />
        <WhatWeBuildSection onOpenContact={openContact} />
        <HowWeThinkSection />
        <ExperienceSection />
        <SelectedWorkSection />
        <HowWeBuildSection />
        <IndustriesSection onOpenContact={openContact} />
        <WhyLumiSection />
        <CompanyStorySection onOpenContact={openContact} />
        <FinalCTASection onOpenContact={openContact} />
      </main>

      <Footer onOpenContact={openContact} />

      <ContactModal isOpen={contactOpen} onClose={closeContact} />
    </div>
  );
}
