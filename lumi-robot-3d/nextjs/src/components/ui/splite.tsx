"use client";

import { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import type React from "react";
import type { SplineProps } from "@splinetool/react-spline";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps extends Omit<SplineProps, "ref"> {
  scene: string;
  className?: string;
  fallback?: React.ReactNode;
  loadRootMargin?: string;
}

function SplineFallback({ fallback }: { fallback?: React.ReactNode }) {
  if (fallback) {
    return fallback;
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  );
}

class SplineSceneErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <SplineFallback fallback={this.props.fallback} />;
    }

    return this.props.children;
  }
}

export function SplineScene({
  scene,
  className,
  fallback,
  loadRootMargin = "600px",
  ...props
}: SplineSceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const connection = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLowPowerDevice = (navigator.hardwareConcurrency || 2) < 4;

    if (prefersReducedMotion || connection.connection?.saveData || isLowPowerDevice) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      queueMicrotask(() => setShouldLoad(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: loadRootMargin },
    );

    observer.observe(frame);

    return () => observer.disconnect();
  }, [loadRootMargin, shouldLoad]);

  return (
    <div ref={frameRef} className={className}>
      {shouldLoad ? (
        <SplineSceneErrorBoundary fallback={fallback}>
          <Suspense fallback={<SplineFallback fallback={fallback} />}>
            <Spline scene={scene} className="h-full w-full" {...props} />
          </Suspense>
        </SplineSceneErrorBoundary>
      ) : (
        <SplineFallback fallback={fallback} />
      )}
    </div>
  );
}
