import { HeroSection } from "@/components/landing/HeroSection";
import { InsightSection } from "@/components/landing/InsightSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { SectionDivider } from "@/components/landing/SectionDivider";

export default function Home() {
  return (
    <main className="landing-page flex flex-col gap-24 md:gap-32 pb-24">
      <HeroSection />
      <SectionDivider />
      <InsightSection />
      <SectionDivider />
      <HowItWorksSection />
      <SectionDivider />
      <FinalCTASection />
    </main>
  );
}
