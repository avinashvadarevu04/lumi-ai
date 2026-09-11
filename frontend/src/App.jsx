import React, { useCallback, useEffect, useState } from 'react';
import { scheduleScrollRefresh } from './lib/scrollRefresh';
import { SmoothScrollProvider } from './lib/motion/SmoothScroll';
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
import { trackPageView, trackEvent } from './lib/telemetry';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  const openContact = useCallback((source) => {
    trackEvent('CTA_CLICK', { label: typeof source === 'string' ? source : 'talk_to_lumi' });
    setContactOpen(true);
  }, []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const handleIntroComplete = useCallback(() => setLoading(false), []);

  // One page view per load, recorded after the intro hands over.
  useEffect(() => {
    if (loading) return;
    trackPageView();
  }, [loading]);

  // The intro overlay locks body scroll, so every ScrollTrigger created while
  // it is up measures against a page of zero scrollable height. Re-measure once
  // it is gone and the layout has settled.
  useEffect(() => {
    if (loading) return undefined;
    return scheduleScrollRefresh();
  }, [loading]);

  return (
    <SmoothScrollProvider paused={loading || contactOpen}>
      <div className="relative min-h-screen overflow-x-clip bg-black text-white">
        {loading && <LoadingScreen onComplete={handleIntroComplete} />}

        {!loading && <ScrollProgress />}
        <Navbar onOpenContact={openContact} />

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
    </SmoothScrollProvider>
  );
}
