/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI EDIT RECIPE PAGE - UX DESIGN RATIONALE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CHANGES & WHY:
 * 1. Split-view layout (desktop): Recipe left | AI controls right
 *    - Reduces scrolling, keeps context visible
 *    - Clear separation: what you're editing vs. how you're changing it
 * 
 * 2. Sticky status bar (always visible):
 *    - Pending changes count badge
 *    - Candidate state indicator (ready/stale/none)
 *    - Unsaved changes warning
 *    - Primary actions always accessible
 * 
 * 3. Candidate staleness detection:
 *    - Tracks if settings changed after regeneration
 *    - Visual warning on stale candidate
 *    - Prevents confusion about what will be applied
 * 
 * 4. Clear action hierarchy:
 *    - Primary: Regenerate (when changes pending)
 *    - Secondary: Apply (when candidate ready)
 *    - Tertiary: Save (when edits made)
 * 
 * INTENDED FLOW:
 * 1. User sees recipe with inline ingredient actions (replace/remove/lock)
 * 2. User configures AI changes in right panel (macros/intents/notes)
 * 3. Status bar shows pending changes count
 * 4. User clicks "Regenerate" → AI creates candidate
 * 5. Candidate preview appears with comparison
 * 6. User clicks "Apply" → candidate replaces editable recipe
 * 7. User clicks "Save" → persists to database
 * 
 * STATE MODEL:
 * - proposedChanges: User's AI configuration (substitutions, macros, etc.)
 * - candidateRecipe: AI-generated result (null if not generated)
 * - candidateIsStale: true if proposedChanges modified after last regen
 * - lastSavedRecipe: Original from DB (for revert)
 * - editableRecipe: Current working version (may include applied candidate)
 * 
 * CTA STATES:
 * - Regenerate: Enabled when proposedChanges has content
 * - Apply: Enabled only when candidateRecipe exists
 * - Save: Enabled when editableRecipe !== lastSavedRecipe
 * - Revert: Confirms if unsaved changes exist
 * 
 * MANUAL TEST CHECKLIST:
 * □ Replace ingredient → see status "Will replace on regenerate"
 * □ Remove ingredient → see status "Will remove on regenerate"  
 * □ Lock ingredient → icon changes, replace/remove disabled
 * □ Change macro/intent → pending count updates in status bar
 * □ Regenerate → loading state → candidate appears
 * □ Modify setting after regen → stale warning appears
 * □ Apply candidate → editable recipe updates, candidate clears
 * □ Save → persists and redirects
 * □ Revert with unsaved → shows confirmation
 * □ Keyboard nav → all controls reachable via Tab
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Recipe, Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { AIEditPanel } from "@/components/recipe/ai-edit/AIEditPanel";
import { CandidatePreview } from "@/components/recipe/ai-edit/CandidatePreview";
import { RecipeInput } from "@/components/recipe/RecipeEditor";
import { IngredientListDisplay } from "@/components/recipe/ai-edit/IngredientListDisplay";
import { StepsDisplay } from "@/components/recipe/ai-edit/StepsDisplay";
import { TasteRefinementsControl } from "@/components/recipe/ai-edit/TasteRefinementsControl";

export type MacroDirection = "down" | "neutral" | "up";
export type TasteDirection = "down" | "neutral" | "up";

export interface ProposedChanges {
  substitutions: Array<{
    fromIngredientId: string;
    toText?: string | null;
  }>;
  deletions: Array<{
    ingredientId: string;
  }>;
  ingredientModifications: Array<{
    ingredientId: string;
    field: 'quantity' | 'unit' | 'name';
    oldValue: string | number;
    newValue: string | number;
  }>;
  macroDirection: {
    protein: MacroDirection;
    carbs: MacroDirection;
    fat: MacroDirection;
    magnitude?: "small" | "medium" | "large";
  };
  tasteRefinements: {
    saltiness: TasteDirection;
    spiciness: TasteDirection;
    acidity: TasteDirection;
    sweetness: TasteDirection;
    richness: TasteDirection;
  };
  notes: string;
  constraints: {
    preferLocal: boolean;
    avoidSpecialtyIngredients: boolean;
    maintainDishIntegrity: boolean;
  };
  locks: {
    lockedIngredientIds: string[];
  };
  pantryItems: string[];
}

const defaultProposedChanges: ProposedChanges = {
  substitutions: [],
  deletions: [],
  ingredientModifications: [],
  macroDirection: {
    protein: "neutral",
    carbs: "neutral",
    fat: "neutral",
    magnitude: "medium",
  },
  tasteRefinements: {
    saltiness: "neutral",
    spiciness: "neutral",
    acidity: "neutral",
    sweetness: "neutral",
    richness: "neutral",
  },
  notes: "",
  constraints: {
    preferLocal: false,
    avoidSpecialtyIngredients: false,
    maintainDishIntegrity: true,
  },
  locks: {
    lockedIngredientIds: [],
  },
  pantryItems: [],
};

export default function AIEditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeNumber = params.recipeNumber as string;

  const [lastSavedRecipe, setLastSavedRecipe] = useState<Recipe | null>(null);
  const [editableRecipe, setEditableRecipe] = useState<Recipe | null>(null);
  const [candidateRecipe, setCandidateRecipe] = useState<Recipe | null>(null);
  
  const [proposedChanges, setProposedChanges] = useState<ProposedChanges>(defaultProposedChanges);
  const [candidateIsStale, setCandidateIsStale] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [pantryInput, setPantryInput] = useState("");

  // Derived state for UI
  const hasUnsavedEdits = useMemo(() => {
    if (!editableRecipe || !lastSavedRecipe) return false;
    return JSON.stringify(editableRecipe) !== JSON.stringify(lastSavedRecipe);
  }, [editableRecipe, lastSavedRecipe]);

  const pendingChangesCount = useMemo(() => {
    let count = 0;
    count += proposedChanges.substitutions.length;
    count += proposedChanges.deletions.length;
    count += proposedChanges.ingredientModifications.length;
    if (proposedChanges.macroDirection.protein !== "neutral") count++;
    if (proposedChanges.macroDirection.carbs !== "neutral") count++;
    if (proposedChanges.macroDirection.fat !== "neutral") count++;
    if (proposedChanges.tasteRefinements.saltiness !== "neutral") count++;
    if (proposedChanges.tasteRefinements.spiciness !== "neutral") count++;
    if (proposedChanges.tasteRefinements.acidity !== "neutral") count++;
    if (proposedChanges.tasteRefinements.sweetness !== "neutral") count++;
    if (proposedChanges.tasteRefinements.richness !== "neutral") count++;
    if (proposedChanges.notes.trim()) count++;
    count += proposedChanges.pantryItems.length;
    return count;
  }, [proposedChanges]);

  // Track changes to mark candidate as stale
  const updateProposedChanges = useCallback((newChanges: ProposedChanges) => {
    setProposedChanges(newChanges);
    if (candidateRecipe) {
      setCandidateIsStale(true);
    }
  }, [candidateRecipe]);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await fetch(`/api/recipes/${recipeNumber}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message ?? "Recipe not found.");
        }
        const existing: Recipe = await response.json();
        setLastSavedRecipe(existing);
        setEditableRecipe(existing);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [recipeNumber]);

  const toggleLock = (ingredientId: string) => {
    const currentLocks = proposedChanges.locks.lockedIngredientIds;
    const isLocked = currentLocks.includes(ingredientId);
    const newLocks = isLocked
      ? currentLocks.filter(id => id !== ingredientId)
      : [...currentLocks, ingredientId];

    const nextSubstitutions = isLocked
      ? proposedChanges.substitutions
      : proposedChanges.substitutions.filter(sub => sub.fromIngredientId !== ingredientId);

    const nextDeletions = isLocked
      ? proposedChanges.deletions
      : proposedChanges.deletions.filter(del => del.ingredientId !== ingredientId);
    
    updateProposedChanges({
      ...proposedChanges,
      substitutions: nextSubstitutions,
      deletions: nextDeletions,
      locks: {
        lockedIngredientIds: newLocks,
      },
    });
  };

  const addSubstitution = (ingredientId: string, toText?: string | null) => {
    const withoutExisting = proposedChanges.substitutions.filter(sub => sub.fromIngredientId !== ingredientId);
    const withoutDeletion = proposedChanges.deletions.filter(del => del.ingredientId !== ingredientId);
    const withoutLock = proposedChanges.locks.lockedIngredientIds.filter(id => id !== ingredientId);

    updateProposedChanges({
      ...proposedChanges,
      substitutions: [...withoutExisting, { fromIngredientId: ingredientId, toText }],
      deletions: withoutDeletion,
      locks: {
        lockedIngredientIds: withoutLock,
      },
    });
  };

  const removeSubstitution = (index: number) => {
    const updated = proposedChanges.substitutions.filter((_, i) => i !== index);
    updateProposedChanges({
      ...proposedChanges,
      substitutions: updated,
    });
  };

  const addDeletion = (ingredientId: string) => {
    const alreadyQueued = proposedChanges.deletions.some(del => del.ingredientId === ingredientId);
    const withoutSubstitution = proposedChanges.substitutions.filter(sub => sub.fromIngredientId !== ingredientId);
    const withoutLock = proposedChanges.locks.lockedIngredientIds.filter(id => id !== ingredientId);

    updateProposedChanges({
      ...proposedChanges,
      substitutions: withoutSubstitution,
      locks: { lockedIngredientIds: withoutLock },
      deletions: alreadyQueued
        ? proposedChanges.deletions
        : [...proposedChanges.deletions, { ingredientId }],
    });
  };

  const removeDeletion = (index: number) => {
    const updated = proposedChanges.deletions.filter((_, i) => i !== index);
    updateProposedChanges({
      ...proposedChanges,
      deletions: updated,
    });
  };

  const handleIngredientUpdate = (ingredientIndex: number, field: 'quantity' | 'unit' | 'name', value: string | number) => {
    if (!editableRecipe || !lastSavedRecipe) return;
    
    const originalValue = lastSavedRecipe.ingredients[ingredientIndex][field];
    const ingredientId: string = `ingredient-${ingredientIndex}`;
    
    // Update the editable recipe
    const updatedIngredients = [...editableRecipe.ingredients];
    updatedIngredients[ingredientIndex] = {
      ...updatedIngredients[ingredientIndex],
      [field]: value,
    };
    
    setEditableRecipe({
      ...editableRecipe,
      ingredients: updatedIngredients,
    });
    
    // Track the modification in proposedChanges relative to original recipe
    const existingModIndex = proposedChanges.ingredientModifications.findIndex(
      mod => mod.ingredientId === ingredientId && mod.field === field
    );
    
    const updatedModifications = [...proposedChanges.ingredientModifications];
    
    if (existingModIndex >= 0) {
      // Update existing modification
      updatedModifications[existingModIndex] = {
        ...updatedModifications[existingModIndex],
        newValue: value,
      };
    } else {
      // Add new modification
      updatedModifications.push({
        ingredientId,
        field,
        oldValue: originalValue,
        newValue: value,
      });
    }
    
    const lockedIngredientIds = proposedChanges.locks.lockedIngredientIds.includes(ingredientId)
      ? proposedChanges.locks.lockedIngredientIds
      : [...proposedChanges.locks.lockedIngredientIds, ingredientId];
    
    updateProposedChanges({
      ...proposedChanges,
      locks: { lockedIngredientIds },
      ingredientModifications: updatedModifications,
    });
  };

  const handleRegenerateRecipe = async () => {
    if (!editableRecipe) return;

    setRegenerating(true);
    setApplyError("");

    try {
      const payload = {
        originalRecipe: editableRecipe,
        locationHint: null,
        constraints: proposedChanges.constraints,
        locks: proposedChanges.locks,
        changes: {
          substitutions: proposedChanges.substitutions,
          deletions: proposedChanges.deletions,
          ingredientModifications: proposedChanges.ingredientModifications,
        },
        macroDirection: proposedChanges.macroDirection,
        tasteRefinements: proposedChanges.tasteRefinements,
        notes: proposedChanges.notes,
        pantryItems: proposedChanges.pantryItems,
      };

      const response = await fetch(`/api/recipes/${editableRecipe.id}/ai-regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to regenerate recipe.");
      }

      const candidate: Recipe = await response.json();
      setCandidateRecipe(candidate);
      setCandidateIsStale(false);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to regenerate recipe.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleApplyCandidate = () => {
    if (!candidateRecipe) return;
    
    setEditableRecipe({
      ...editableRecipe!,
      title: candidateRecipe.title,
      description: candidateRecipe.description,
      ingredients: candidateRecipe.ingredients,
      steps: candidateRecipe.steps,
      prepTimeMinutes: candidateRecipe.prepTimeMinutes,
      cookTimeMinutes: candidateRecipe.cookTimeMinutes,
      servings: candidateRecipe.servings,
      tags: candidateRecipe.tags,
    });
    
    setCandidateRecipe(null);
    setCandidateIsStale(false);
    setApplyError("");
  };

  const handleRevertChanges = () => {
    const hasUnsavedChanges = JSON.stringify(editableRecipe) !== JSON.stringify(lastSavedRecipe);
    
    if (hasUnsavedChanges) {
      setShowRevertModal(true);
    } else {
      performRevert();
    }
  };

  const performRevert = () => {
    if (!lastSavedRecipe) return;
    
    setEditableRecipe(JSON.parse(JSON.stringify(lastSavedRecipe)));
    setProposedChanges(defaultProposedChanges);
    setCandidateRecipe(null);
    setCandidateIsStale(false);
    setApplyError("");
    setShowRevertModal(false);
  };

  const handleSaveChanges = async () => {
    if (!editableRecipe) return;

    try {
      const recipeData: RecipeInput = {
        title: editableRecipe.title,
        description: editableRecipe.description,
        ingredients: editableRecipe.ingredients,
        steps: editableRecipe.steps,
        prepTimeMinutes: editableRecipe.prepTimeMinutes,
        cookTimeMinutes: editableRecipe.cookTimeMinutes,
        servings: editableRecipe.servings,
        tags: editableRecipe.tags,
      };

      const response = await fetch(`/api/recipes/${editableRecipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to save recipe.");
      }

      router.push(`/recipe/${editableRecipe.id}`);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to save recipe.");
    }
  };

  const handleCancel = () => {
    router.push(`/recipe/${editableRecipe?.id ?? recipeNumber}`);
  };

  const handleAddPantryItem = () => {
    const trimmed = pantryInput.trim();
    if (!trimmed) return;

    const normalized = trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const newItems = normalized.filter(
      (item) => !proposedChanges.pantryItems.includes(item)
    );

    if (!newItems.length) {
      setPantryInput("");
      return;
    }

    updateProposedChanges({
      ...proposedChanges,
      pantryItems: [...proposedChanges.pantryItems, ...newItems],
    });
    setPantryInput("");
  };

  const handleRemovePantryItem = (item: string) => {
    updateProposedChanges({
      ...proposedChanges,
      pantryItems: proposedChanges.pantryItems.filter((i) => i !== item),
    });
  };

  const handlePantryKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddPantryItem();
    }
  };

  const handlePantryBlur = () => {
    handleAddPantryItem();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center pt-24 pb-16 px-4 sm:px-0">
        <p className="text-muted">Loading recipe...</p>
      </main>
    );
  }

  if (error && !editableRecipe) {
    return (
      <main className="flex min-h-screen flex-col items-center pt-24 pb-16 px-4 sm:px-0">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col pt-20 pb-32">
      {/* Header */}
      <div className="w-full bg-background/95 top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="font-caveat text-3xl sm:text-4xl">AI Edit Recipe</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1">Configure changes, regenerate, review, then save</p>
            </div>
          </div>
        </div>
      </div>

      {applyError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200 text-sm">
            {applyError}
          </div>
        </div>
      )}

      {/* Split view layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Recipe Content */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6 space-y-4">
              <div>
                <label htmlFor="recipe-title" className="text-sm text-muted mb-1 block">
                  Title
                </label>
                <Input
                  id="recipe-title"
                  value={editableRecipe?.title ?? ""}
                  onChange={(e) =>
                    setEditableRecipe((prev) =>
                      prev ? { ...prev, title: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <label htmlFor="recipe-description" className="text-sm text-muted mb-1 block">
                  Description
                </label>
                <Textarea
                  id="recipe-description"
                  rows={3}
                  value={editableRecipe?.description ?? ""}
                  onChange={(e) =>
                    setEditableRecipe((prev) =>
                      prev ? { ...prev, description: e.target.value } : prev
                    )
                  }
                />
              </div>
            </Card>

            {/* Ingredients with inline actions */}
            <Card className="p-6">
              <IngredientListDisplay
                recipe={editableRecipe!}
                proposedChanges={proposedChanges}
                onToggleLock={toggleLock}
                onAddSubstitution={addSubstitution}
                onRemoveSubstitution={removeSubstitution}
                onAddDeletion={addDeletion}
                onRemoveDeletion={removeDeletion}
                onIngredientUpdate={handleIngredientUpdate}
              />
            </Card>

            {/* Pantry additions */}
            <Card className="p-6 space-y-5">
              <div>
                <h3 className="text-lg font-semibold tracking-[0.1rem]">
                  <span className="text-lg">Add More Ingredients</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Tell the AI about extra ingredients to weave into the regenerated recipe.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  className="flex-1"
                  placeholder="e.g. canned chickpeas, toasted almonds"
                  value={pantryInput}
                  onChange={(event) => setPantryInput(event.target.value)}
                  onKeyDown={handlePantryKeyDown}
                  onBlur={handlePantryBlur}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddPantryItem}
                  disabled={!pantryInput.trim()}
                >
                  Add
                </Button>
              </div>

              {proposedChanges.pantryItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {proposedChanges.pantryItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-[--radius-input] bg-accent/10 border border-accent/20 px-3 py-1 text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemovePantryItem(item)}
                        className="text-muted hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted italic">No pantry items added yet</p>
              )}
            </Card>

            {/* Notes for AI */}
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold tracking-[0.1rem]">
                  <span className="text-lg">Notes for AI</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Configure how the AI should modify your recipe.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="ai-notes">
                  Notes
                </label>
                <p className="text-xs text-muted mb-2">
                  Add any additional instructions or preferences
                </p>
                <Textarea
                  id="ai-notes"
                  rows={3}
                  placeholder="e.g. Make it more Mediterranean, reduce cooking time, add more vegetables..."
                  value={proposedChanges.notes}
                  onChange={(e) => updateProposedChanges({
                    ...proposedChanges,
                    notes: e.target.value,
                  })}
                />
              </div>

              {/* Macro Direction */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Macro Content
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {/* Protein Column */}
                  <div>
                    <label className="block text-xs text-muted mb-2 text-center">Protein</label>
                    <div className="flex flex-col items-center">
                      {["up", "neutral", "down"].map((direction, idx) => (
                        <button
                          key={direction}
                          type="button"
                          onClick={() => updateProposedChanges({
                            ...proposedChanges,
                            macroDirection: {
                              ...proposedChanges.macroDirection,
                              protein: direction as "down" | "neutral" | "up",
                            },
                          })}
                          className={`
                            w-[30px] h-9 text-sm font-medium transition-colors flex items-center justify-center
                            ${idx === 0 ? "rounded-t-full" : idx === 2 ? "rounded-b-full" : ""}
                            ${proposedChanges.macroDirection.protein === direction
                              ? "bg-accent text-accent-foreground"
                              : "bg-surface-2 text-muted hover:bg-surface-3"
                            }
                          `}
                        >
                          {direction === "down" ? "↓" : direction === "up" ? "↑" : "-"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Carbs Column */}
                  <div>
                    <label className="block text-xs text-muted mb-2 text-center">Carbs</label>
                    <div className="flex flex-col items-center">
                      {["up", "neutral", "down"].map((direction, idx) => (
                        <button
                          key={direction}
                          type="button"
                          onClick={() => updateProposedChanges({
                            ...proposedChanges,
                            macroDirection: {
                              ...proposedChanges.macroDirection,
                              carbs: direction as "down" | "neutral" | "up",
                            },
                          })}
                          className={`
                            w-[30px] h-9 text-sm font-medium transition-colors flex items-center justify-center
                            ${idx === 0 ? "rounded-t-full" : idx === 2 ? "rounded-b-full" : ""}
                            ${proposedChanges.macroDirection.carbs === direction
                              ? "bg-accent text-accent-foreground"
                              : "bg-surface-2 text-muted hover:bg-surface-3"
                            }
                          `}
                        >
                          {direction === "down" ? "↓" : direction === "up" ? "↑" : "-"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fat Column */}
                  <div>
                    <label className="block text-xs text-muted mb-2 text-center">Fat</label>
                    <div className="flex flex-col items-center">
                      {["up", "neutral", "down"].map((direction, idx) => (
                        <button
                          key={direction}
                          type="button"
                          onClick={() => updateProposedChanges({
                            ...proposedChanges,
                            macroDirection: {
                              ...proposedChanges.macroDirection,
                              fat: direction as "down" | "neutral" | "up",
                            },
                          })}
                          className={`
                            w-[30px] h-9 text-sm font-medium transition-colors flex items-center justify-center
                            ${idx === 0 ? "rounded-t-full" : idx === 2 ? "rounded-b-full" : ""}
                            ${proposedChanges.macroDirection.fat === direction
                              ? "bg-accent text-accent-foreground"
                              : "bg-surface-2 text-muted hover:bg-surface-3"
                            }
                          `}
                        >
                          {direction === "down" ? "↓" : direction === "up" ? "↑" : "-"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Taste Refinements */}
              <div>
                <TasteRefinementsControl
                  tasteRefinements={proposedChanges.tasteRefinements}
                  onUpdate={(taste, direction) => updateProposedChanges({
                    ...proposedChanges,
                    tasteRefinements: {
                      ...proposedChanges.tasteRefinements,
                      [taste]: direction,
                    },
                  })}
                />
              </div>

              {/* Additional Constraints */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Additional Constraints
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                    <input
                      type="checkbox"
                      checked={proposedChanges.constraints.preferLocal}
                      onChange={(e) => updateProposedChanges({
                        ...proposedChanges,
                        constraints: {
                          ...proposedChanges.constraints,
                          preferLocal: e.target.checked,
                        },
                      })}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">Prefer locally available options</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                    <input
                      type="checkbox"
                      checked={proposedChanges.constraints.avoidSpecialtyIngredients}
                      onChange={(e) => updateProposedChanges({
                        ...proposedChanges,
                        constraints: {
                          ...proposedChanges.constraints,
                          avoidSpecialtyIngredients: e.target.checked,
                        },
                      })}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">Avoid specialty ingredients</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                    <input
                      type="checkbox"
                      checked={proposedChanges.constraints.maintainDishIntegrity}
                      onChange={(e) => updateProposedChanges({
                        ...proposedChanges,
                        constraints: {
                          ...proposedChanges.constraints,
                          maintainDishIntegrity: e.target.checked,
                        },
                      })}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">Maintain dish integrity</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="p-6">
              <StepsDisplay recipe={editableRecipe!} />
            </Card>

            {/* Original Recipe Times */}
            {lastSavedRecipe && (
              <Card className="p-6">
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent mb-1">
                        {lastSavedRecipe.prepTimeMinutes || 0}
                      </div>
                      <div className="text-sm text-muted">Prep Time (min)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent mb-1">
                        {typeof lastSavedRecipe.cookTimeMinutes === "number" ? lastSavedRecipe.cookTimeMinutes : 0}
                      </div>
                      <div className="text-sm text-muted">Cook Time (min)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent mb-1">
                        {lastSavedRecipe.servings || 0}
                      </div>
                      <div className="text-sm text-muted">Servings</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: AI Controls & Preview */}
          <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            {/* AI Edit Panel */}
            <AIEditPanel
              recipe={editableRecipe}
              proposedChanges={proposedChanges}
              onProposedChangesUpdate={updateProposedChanges}
              onRegenerate={handleRegenerateRecipe}
              regenerating={regenerating}
              hasCandidate={!!candidateRecipe}
              pendingChangesCount={pendingChangesCount}
            />

            {/* Candidate Preview */}
            {candidateRecipe && (
              <CandidatePreview
                candidate={candidateRecipe}
                proposedChanges={proposedChanges}
                isStale={candidateIsStale}
                onApply={handleApplyCandidate}
                onRevert={handleRevertChanges}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted hidden sm:block">
              {candidateIsStale && candidateRecipe && (
                <span className="text-amber-600 dark:text-amber-400">
                  ⚠️ Settings changed since regeneration
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={handleRevertChanges}
                className="hidden sm:inline-flex"
              >
                Revert
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveChanges}
                disabled={!hasUnsavedEdits}
              >
                Save Recipe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Aria-live region for status updates */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {regenerating && "Regenerating recipe with AI..."}
        {candidateRecipe && !regenerating && "Recipe regenerated successfully. Review the candidate below."}
        {applyError && `Error: ${applyError}`}
      </div>

      {/* Revert Confirmation Modal */}
      <Modal
        isOpen={showRevertModal}
        onClose={() => setShowRevertModal(false)}
        ariaLabel="Confirm revert changes"
      >
        <ModalHeader>
          <ModalTitle>Revert Changes?</ModalTitle>
          <ModalDescription>
            Revert will discard unsaved changes and restore the recipe to its last saved state. Continue?
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowRevertModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={performRevert}
            className="bg-red-600 hover:bg-red-700"
          >
            Revert
          </Button>
        </ModalFooter>
      </Modal>
    </main>
  );
}
