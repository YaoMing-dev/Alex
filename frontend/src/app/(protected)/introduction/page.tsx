"use client";

import HeroSection from "@/components/introduction/HeroSection";
import AISection from "@/components/introduction/AISection";
import FeatureSection from "@/components/introduction/FeatureSection";
import HowItWorksSection from "@/components/introduction/HowItWorksSection";
import CTASection from "@/components/introduction/CTASection";

export default function IntroPage() {
  return (
    <>
      <HeroSection />
      <AISection />
      <FeatureSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}