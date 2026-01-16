import { HeroSection } from "@/components/landing/HeroSection";
import { InsightSection } from "@/components/landing/InsightSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AssembleDemoSection } from "@/components/landing/AssembleDemoSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { FlowLineDivider } from "@/components/landing/FlowLineDivider";

export default function Home() {
  return (
    <main className="landing-page flex flex-col gap-12 sm:gap-16 md:gap-24 lg:gap-24">
      <HeroSection />
      <FlowLineDivider />
      <InsightSection />
      <FlowLineDivider />
      <HowItWorksSection />
      <FlowLineDivider />
      <AssembleDemoSection />
      <FlowLineDivider />
      <FinalCTASection />
    </main>
  );
}
