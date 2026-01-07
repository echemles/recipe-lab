"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type StepsListBuilderProps = {
  steps: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function StepsListBuilder({
  steps,
  onChange,
  onAdd,
  onRemove,
}: StepsListBuilderProps) {
  const hasSteps = steps.length > 0 && steps.some(step => step.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-[0.1rem]">Instructions</h3>
          <p className="text-xs text-muted mt-0.5">
            Break down the recipe into clear, sequential steps
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
        >
          + Add step
        </Button>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-[--radius-card] border-2 border-dashed border-border bg-surface-2 p-6 text-center">
          <p className="text-sm text-muted mb-3">No steps added yet</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAdd}
          >
            Add your first step
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-muted font-medium w-7 pt-2 text-sm">
                {idx + 1}.
              </span>
              <Input
                type="text"
                placeholder={`Step ${idx + 1} (e.g. Preheat oven to 350°F)`}
                className="flex-1"
                value={step}
                onChange={(e) => onChange(idx, e.target.value)}
                aria-label={`Step ${idx + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 mt-0.5"
                onClick={() => onRemove(idx)}
                aria-label={`Remove step ${idx + 1}`}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}

      {!hasSteps && steps.length > 0 && (
        <p className="text-xs text-muted italic">
          Tip: Add clear instructions for each step
        </p>
      )}
    </div>
  );
}
