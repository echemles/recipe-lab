"use client";

import { useState } from "react";
import { MacroInformation } from "@/types/recipe";
import { TextLink } from "@/components/ui/TextLink";

interface PrimaryNutritionMetricsProps {
  macros: MacroInformation;
  scaleFactor?: number;
}

export function PrimaryNutritionMetrics({ macros, scaleFactor = 1 }: PrimaryNutritionMetricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryMetrics = [
    { label: "Calories", value: Math.round(macros.calories * scaleFactor), unit: "" },
    { label: "Protein", value: (macros.protein * scaleFactor).toFixed(1), unit: "g" },
    { label: "Carbs", value: (macros.carbohydrates * scaleFactor).toFixed(1), unit: "g" },
    { label: "Fat", value: (macros.fat * scaleFactor).toFixed(1), unit: "g" },
  ];

  const nonMacroMetrics = [
    { label: "Fiber", value: macros.fiber, unit: "g" },
    { label: "Sugar", value: macros.sugar, unit: "g" },
    { label: "Sodium", value: macros.sodium, unit: "mg" },
    { label: "Cholesterol", value: macros.cholesterol, unit: "mg" },
    { label: "Sat. Fat", value: macros.saturatedFat, unit: "g" },
    { label: "Unsat. Fat", value: macros.unsaturatedFat, unit: "g" },
  ].filter(metric => metric.value !== undefined && metric.value !== null);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-12">
        {primaryMetrics.map((metric) => (
          <div key={metric.label} className="flex items-baseline gap-2">
            <p className="text-xs sm:text-sm text-muted uppercase tracking-wide min-w-fit">
              {metric.label}:
            </p>
            <p className="text-lg sm:text-xl font-semibold">
              {metric.value}
              <span className="text-sm sm:text-base font-normal text-muted ml-1">
                {metric.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {nonMacroMetrics.length > 0 && (
        <>
          <TextLink
            onClick={() => setIsExpanded(!isExpanded)}
            isExpanded={isExpanded}
            aria-controls="non-macro-nutrition"
          >
            {isExpanded ? "Hide nutrition details" : "More nutrition details"}
          </TextLink>
          
          <div
            id="non-macro-nutrition"
            className={`overflow-hidden transition-all duration-175 ease-in-out ${
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 lg:gap-8 pt-2">
              {nonMacroMetrics.map((metric) => (
                <div key={metric.label} className="flex items-baseline gap-2">
                  <p className="text-xs text-muted uppercase tracking-wide min-w-fit">
                    {metric.label}:
                  </p>
                  <p className="text-sm font-medium">
                    {metric.unit === "mg" 
                      ? Math.round(metric.value! * scaleFactor)
                      : (metric.value! * scaleFactor).toFixed(1)
                    }
                    <span className="text-xs text-muted ml-1">{metric.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}