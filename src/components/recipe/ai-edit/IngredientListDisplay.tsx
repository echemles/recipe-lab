"use client";

import { Recipe } from "@/types/recipe";
import { ProposedChanges } from "@/app/recipe/[recipeNumber]/ai-edit/page";

interface IngredientListDisplayProps {
  recipe: Recipe;
  proposedChanges: ProposedChanges;
  onToggleLock: (ingredientId: string) => void;
  onAddSubstitution: (fromIngredientId: string, toText?: string | null) => void;
  onRemoveSubstitution: (index: number) => void;
  onAddDeletion: (ingredientId: string) => void;
  onRemoveDeletion: (index: number) => void;
  onIngredientUpdate?: (ingredientIndex: number, field: 'quantity' | 'unit' | 'name', value: string | number) => void;
}

export function IngredientListDisplay({
  recipe,
  proposedChanges,
  onToggleLock,
  onAddSubstitution,
  onRemoveSubstitution,
  onAddDeletion,
  onRemoveDeletion,
  onIngredientUpdate,
}: IngredientListDisplayProps) {
  const isLocked = (index: number) => {
    const id = `ingredient-${index}`;
    return proposedChanges.locks.lockedIngredientIds.includes(id);
  };

  const isQueuedForDeletion = (index: number) => {
    const id = `ingredient-${index}`;
    return proposedChanges.deletions.some(del => del.ingredientId === id);
  };

  const isQueuedForSubstitution = (index: number) => {
    const id = `ingredient-${index}`;
    return proposedChanges.substitutions.some(sub => sub.fromIngredientId === id);
  };

  const getSubstitutionText = (index: number) => {
    const id = `ingredient-${index}`;
    const substitution = proposedChanges.substitutions.find(sub => sub.fromIngredientId === id);
    return substitution?.toText;
  };

  const handleReplaceClick = (ingredientId: string) => {
    if (isLocked(parseInt(ingredientId.split("-")[1]))) {
      onToggleLock(ingredientId);
    }
    const alreadyQueued = proposedChanges.substitutions.some(
      (sub) => sub.fromIngredientId === ingredientId
    );
    if (!alreadyQueued) {
      onAddSubstitution(ingredientId, null);
    }
  };

  const handleDeleteClick = (ingredientId: string) => {
    if (isLocked(parseInt(ingredientId.split("-")[1]))) {
      onToggleLock(ingredientId);
    }
    onAddDeletion(ingredientId);
  };

  const handleCancelSubstitution = (ingredientId: string) => {
    const id = `ingredient-${parseInt(ingredientId.split("-")[1])}`;
    const subIndex = proposedChanges.substitutions.findIndex(sub => sub.fromIngredientId === id);
    if (subIndex !== -1) {
      onRemoveSubstitution(subIndex);
    }
  };

  const handleCancelDeletion = (ingredientId: string) => {
    const id = `ingredient-${parseInt(ingredientId.split("-")[1])}`;
    const delIndex = proposedChanges.deletions.findIndex(del => del.ingredientId === id);
    if (delIndex !== -1) {
      onRemoveDeletion(delIndex);
    }
  };

  const handleIngredientUpdate = (index: number, field: 'quantity' | 'unit' | 'name', value: string | number) => {
    // Auto-lock ingredient when edited
    const id = `ingredient-${index}`;
    if (!isLocked(index)) {
      onToggleLock(id);
    }
    onIngredientUpdate?.(index, field, value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-[0.1rem]">
            <span className="text-lg">Ingredients</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Click icons to replace or remove ingredients. Lock icon prevents AI changes.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recipe.ingredients.map((ing, idx) => {
          const id = `ingredient-${idx}`;
          const locked = isLocked(idx);
          const queuedForDeletion = isQueuedForDeletion(idx);
          const queuedForSubstitution = isQueuedForSubstitution(idx);
          const substitutionText = getSubstitutionText(idx);

          const rowHighlightClass = locked
            ? "ingredient-row-locked"
            : queuedForDeletion
            ? "ingredient-row-delete"
            : queuedForSubstitution
            ? "ingredient-row-replace"
            : "ingredient-row-default";

          return (
            <div key={idx} className="space-y-2">
              <div
                className={`
                  rounded-lg border transition-all
                  ${rowHighlightClass}
                `}
              >
                <div className="flex items-center gap-2 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-col">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={ing.quantity}
                          onChange={(e) => handleIngredientUpdate(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm font-semibold text-accent bg-surface-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
                          step="0.5"
                          min="0"
                        />
                        <input
                          type="text"
                          value={ing.unit}
                          onChange={(e) => handleIngredientUpdate(idx, 'unit', e.target.value)}
                          className="w-16 px-2 py-1 text-sm font-semibold text-accent bg-surface-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
                          placeholder="unit"
                        />
                      </div>
                      <div className="w-full text-sm font-medium text-foreground">
                        {ing.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!queuedForDeletion && !queuedForSubstitution && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReplaceClick(id)}
                          className="p-2 rounded transition-colors text-muted hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          aria-label="Replace ingredient"
                          title="Replace ingredient"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <polyline points="23 20 23 14 17 14"></polyline>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(id)}
                          className="p-2 rounded transition-colors text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          aria-label="Remove ingredient"
                          title="Remove ingredient"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </>
                    )}

                    {queuedForSubstitution && (
                      <button
                        type="button"
                        onClick={() => handleCancelSubstitution(id)}
                        className="p-2 rounded transition-colors text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        aria-label="Cancel substitution"
                        title="Cancel substitution"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}

                    {queuedForDeletion && (
                      <button
                        type="button"
                        onClick={() => handleCancelDeletion(id)}
                        className="p-2 rounded transition-colors text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                        aria-label="Cancel deletion"
                        title="Cancel deletion"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}

                    {!queuedForDeletion && !queuedForSubstitution && (
                      <button
                        type="button"
                        onClick={() => onToggleLock(id)}
                        className={`
                          p-2 rounded transition-colors
                          ${locked
                            ? "text-accent hover:bg-accent/20"
                            : "text-muted hover:text-foreground hover:bg-surface-2"
                          }
                        `}
                        aria-label={locked ? "Unlock ingredient" : "Lock ingredient"}
                        aria-pressed={locked}
                        title={locked ? "Unlock ingredient" : "Lock ingredient"}
                      >
                        {locked ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {(locked || queuedForDeletion || queuedForSubstitution) && (
                <div className="flex flex-wrap gap-2 px-1">
                  {locked && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full chip-locked text-[11px] font-semibold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Locked
                    </span>
                  )}
                  {queuedForSubstitution && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full chip-replace text-[11px] font-semibold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <polyline points="23 20 23 14 17 14"></polyline>
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                      </svg>
                      Replace{ substitutionText ? ` → ${substitutionText}` : "" }
                    </span>
                  )}
                  {queuedForDeletion && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full chip-delete text-[11px] font-semibold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Remove
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted mt-3 p-4 bg-surface-2/60 rounded-lg space-y-2">
        <p className="font-medium text-foreground">Icon guide</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full chip-replace font-semibold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              Replace
            </span>
            <span className="text-muted">Swap this ingredient (AI can choose substitute).</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full chip-delete font-semibold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Remove
            </span>
            <span className="text-muted">Mark for deletion when regenerating.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full chip-locked font-semibold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Locked &nbsp;
            </span>
            <span className="text-muted">Prevent AI from modifying this ingredient.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
