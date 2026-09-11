import { Card } from "@/components/ui/card";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

// Extracted from `OriginSplineCard` in src/components/sections/Timeline.tsx (LUMI AI site).
export function RobotCard() {
  const robotFallback = (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-40 w-40 rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.2),rgba(255,255,255,0.03)_48%,transparent_70%)] shadow-[0_0_80px_rgba(255,255,255,0.12)]" />
    </div>
  );

  return (
    <Card className="relative h-[460px] w-full overflow-hidden border-0 bg-transparent shadow-none md:h-[540px]">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      <div className="flex h-full flex-col md:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center p-5 sm:p-8">
          <h3 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl font-bold uppercase leading-none text-transparent sm:text-4xl md:text-5xl">
            You know the business
          </h3>
          <p className="mt-4 max-w-lg text-xl font-bold uppercase tracking-tight text-neutral-300 sm:text-2xl md:mt-5 md:text-3xl">
            We know the chemistry
          </p>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
            loadRootMargin="120px"
            fallback={robotFallback}
          />
        </div>
      </div>
    </Card>
  );
}

export default RobotCard;
