"use client";

import { Recipe } from "@/types/recipe";
import { Card } from "@/components/ui/Card";
import { ProposedChanges } from "@/app/recipe/[recipeNumber]/ai-edit/page";
import { useState } from "react";

interface CandidatePreviewProps {
  candidate: Recipe;
  proposedChanges: ProposedChanges;
  isStale?: boolean;
  onApply?: () => void;
  onRevert?: () => void;
}

export function CandidatePreview({
  candidate,
  proposedChanges,
  isStale = false,
  onApply,
  onRevert,
}: CandidatePreviewProps) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "instructions">("ingredients");

  const hasSubstitutions = proposedChanges.substitutions.length > 0;
  const hasDeletions = proposedChanges.deletions.length > 0;

  return (
    <Card className={`p-6 ${isStale ? "border-amber-300 dark:border-amber-700 border-2" : ""}`}>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold">Change Preview</h2>
          {isStale && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
              Outdated
            </span>
          )}
        </div>
        {isStale && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Settings changed since this was generated. Regenerate to see updated version.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {hasSubstitutions && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              Substitutions applied
            </span>
          )}
          {hasDeletions && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
              Removals applied
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-border">
        <button
          type="button"
          onClick={() => setActiveTab("ingredients")}
          className={`
            px-4 py-2 text-sm font-medium transition-colors border-b-2
            ${activeTab === "ingredients"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
            }
          `}
          role="tab"
          aria-selected={activeTab === "ingredients"}
          aria-controls="ingredients-panel"
        >
          Ingredients ({candidate.ingredients.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("instructions")}
          className={`
            px-4 py-2 text-sm font-medium transition-colors border-b-2
            ${activeTab === "instructions"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
            }
          `}
          role="tab"
          aria-selected={activeTab === "instructions"}
          aria-controls="instructions-panel"
        >
          Instructions ({candidate.steps.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "ingredients" && (
        <div
          id="ingredients-panel"
          role="tabpanel"
          aria-labelledby="ingredients-tab"
        >
          <ul className="space-y-2">
            {candidate.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-muted mt-0.5">•</span>
                <span>
                  <strong>{ing.quantity} {ing.unit}</strong> {ing.name}
                  {ing.note && <span className="text-muted italic"> ({ing.note})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "instructions" && (
        <div
          id="instructions-panel"
          role="tabpanel"
          aria-labelledby="instructions-tab"
        >
          <ol className="space-y-3 list-decimal list-inside">
            {candidate.steps.map((step, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Recipe Metadata */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-3 text-sm text-muted">
          {candidate.prepTimeMinutes && (
            <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
              Prep: {candidate.prepTimeMinutes} min
            </span>
          )}
          {typeof candidate.cookTimeMinutes === "number" && (
            <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
              {candidate.cookTimeMinutes === 0
                ? "No cook time"
                : `Cook: ${candidate.cookTimeMinutes} min`}
            </span>
          )}
          {candidate.servings && (
            <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
              Serves {candidate.servings}
            </span>
          )}
        </div>
      </div>

      {/* Apply Button */}
      {(onApply || onRevert) && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {onApply && (
              <button
                type="button"
                onClick={onApply}
                disabled={isStale}
                className={`
                  flex-1 px-4 py-2.5 text-sm font-medium rounded-[--radius-input] transition-colors
                  ${isStale
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                  }
                `}
                aria-label="Apply regenerated recipe"
              >
                {isStale ? "Regenerate to Apply Changes" : "Apply Regenerated Recipe"}
              </button>
            )}
            {onRevert && (
              <button
                type="button"
                onClick={onRevert}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-[--radius-input] transition-colors bg-surface-2 text-foreground hover:bg-surface-3"
                aria-label="Revert changes"
              >
                Revert Changes
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
