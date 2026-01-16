"use client";

import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProposedChanges } from "@/app/recipe/[recipeNumber]/ai-edit/page";
import { ProposedChangesSummary } from "./ProposedChangesSummary";
import { FoodLoadingAnimation } from "../FoodLoadingAnimation";

interface AIEditPanelProps {
  recipe: Recipe | null;
  proposedChanges: ProposedChanges;
  onProposedChangesUpdate: (changes: ProposedChanges) => void;
  onRegenerate: () => void;
  regenerating: boolean;
  hasCandidate: boolean;
  pendingChangesCount: number;
}

export function AIEditPanel({
  recipe,
  proposedChanges,
  onProposedChangesUpdate,
  onRegenerate,
  regenerating,
  hasCandidate,
  pendingChangesCount,
}: AIEditPanelProps) {
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  const handleRegenerateClick = async () => {
    setRegenerateSuccess(false);
    await onRegenerate();
    setRegenerateSuccess(true);
    
    setTimeout(() => setRegenerateSuccess(false), 3000);
  };

  if (!recipe) return null;

  return (
    <Card className="relative p-6 space-y-6">
      {pendingChangesCount > 0 && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
          {pendingChangesCount} pending
        </span>
      )}
      <div>
        <h2 className="text-xl font-semibold mb-1">AI Edit</h2>
        <p className="text-sm text-muted">
          Propose changes and regenerate a new version. Nothing is applied until you click Apply.
        </p>
      </div>

      {/* Success announcement for screen readers */}
      {regenerateSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          Recipe regenerated successfully
        </div>
      )}

      {/* Proposed Changes Summary */}
      <ProposedChangesSummary
        proposedChanges={proposedChanges}
        recipe={recipe}
      />

      {/* Actions */}
      <div className="pt-4 border-t border-border">
        <Button
          type="button"
          variant="primary"
          onClick={handleRegenerateClick}
          disabled={regenerating}
          className="w-full"
        >
          {regenerating ? "Regenerating..." : "Regenerate Recipe"}
        </Button>
        {regenerating && (
          <div className="mt-4 space-y-4">
            <FoodLoadingAnimation
              size="sm"
              message="Layering your requested changes..."
              className="mx-auto"
            />
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {/* Cancel handled by parent */}}
                disabled={true}
                className="min-w-[100px]"
              >
                Regenerating...
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
