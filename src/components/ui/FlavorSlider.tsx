"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { springs } from "@/lib/motion";

interface FlavorSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function FlavorSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
}: FlavorSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Calculate thumb position based on value
  const getPositionFromValue = (val: number) => {
    const percentage = (val - min) / (max - min);
    if (!trackRef.current) return 0;
    const trackWidth = trackRef.current.offsetWidth - 20; // minus thumb width
    return percentage * trackWidth;
  };

  // Calculate value from position
  const getValueFromPosition = (position: number) => {
    if (!trackRef.current) return value;
    const trackWidth = trackRef.current.offsetWidth - 20;
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  // Update thumb position when value changes
  useEffect(() => {
    x.set(getPositionFromValue(value));
  }, [value, x]);

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!trackRef.current) return;
    const newPosition = Math.max(
      0,
      Math.min(trackRef.current.offsetWidth - 20, info.point.x - trackRef.current.getBoundingClientRect().left - 10)
    );
    const newValue = getValueFromPosition(newPosition);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue = value;
    
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        newValue = Math.min(max, value + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        newValue = Math.max(min, value - step);
        break;
      case "Home":
        e.preventDefault();
        newValue = min;
        break;
      case "End":
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }
    
    onChange(newValue);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || e.target !== trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left - 10;
    const newValue = getValueFromPosition(clickPosition);
    onChange(newValue);
  };

  const fillWidth = useTransform(
    x,
    (latest) => {
      if (!trackRef.current) return "0%";
      const trackWidth = trackRef.current.offsetWidth - 20;
      return `${((latest / trackWidth) * 100).toFixed(2)}%`;
    }
  );

  const springConfig = prefersReducedMotion
    ? { type: "tween" as const, duration: 0 }
    : springs.snappy;

  return (
    <div className="w-full py-2">
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative h-2 rounded-full bg-surface-2 cursor-pointer"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Fill track */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
          style={{ width: fillWidth }}
          initial={false}
        />

        {/* Thumb */}
        <motion.div
          drag="x"
          dragConstraints={trackRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          style={{ x }}
          className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing focus:outline-none"
          whileHover={
            prefersReducedMotion
              ? {}
              : { scale: 1.1 }
          }
          whileTap={
            prefersReducedMotion
              ? {}
              : { scale: 0.95 }
          }
          transition={springConfig}
        >
          <div className="relative">
            {/* Glow effect on hover/drag */}
            {(isHovered || isDragging) && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full bg-accent/30 blur-md"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            )}
            
            {/* Thumb circle */}
            <div
              className={`relative w-5 h-5 rounded-full bg-white dark:bg-surface border-2 shadow-lg transition-colors ${
                isDragging
                  ? "border-accent shadow-accent/30"
                  : isHovered
                  ? "border-accent/60"
                  : "border-border"
              }`}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
