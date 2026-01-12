"use client";

import { Ingredient } from "@/types/recipe";

export interface RecipeDraft {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  originalIngredients: Ingredient[];
  steps: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "recipe_lab_drafts";

function getDraftsFromStorage(): Record<string, RecipeDraft> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDraftsToStorage(drafts: Record<string, RecipeDraft>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.error("Failed to save drafts to localStorage", e);
  }
}

export function generateDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllDrafts(): RecipeDraft[] {
  const drafts = getDraftsFromStorage();
  return Object.values(drafts).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getDraftById(id: string): RecipeDraft | null {
  const drafts = getDraftsFromStorage();
  return drafts[id] ?? null;
}

export function saveDraft(draft: RecipeDraft): RecipeDraft {
  const drafts = getDraftsFromStorage();
  const now = new Date().toISOString();
  const updated: RecipeDraft = {
    ...draft,
    updatedAt: now,
  };
  drafts[draft.id] = updated;
  saveDraftsToStorage(drafts);
  return updated;
}

export function createDraftFromPreview(preview: {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  tags?: string[];
}): RecipeDraft {
  const now = new Date().toISOString();
  const draft: RecipeDraft = {
    id: generateDraftId(),
    title: preview.title,
    description: preview.description,
    ingredients: structuredClone(preview.ingredients),
    originalIngredients: structuredClone(preview.ingredients),
    steps: [...preview.steps],
    prepTimeMinutes: preview.prepTimeMinutes,
    cookTimeMinutes: preview.cookTimeMinutes,
    servings: preview.servings,
    tags: preview.tags ? [...preview.tags] : undefined,
    createdAt: now,
    updatedAt: now,
  };
  return saveDraft(draft);
}

export function updateDraftIngredients(
  draftId: string,
  ingredients: Ingredient[]
): RecipeDraft | null {
  const draft = getDraftById(draftId);
  if (!draft) return null;
  return saveDraft({
    ...draft,
    ingredients: structuredClone(ingredients),
  });
}

export function resetDraftIngredients(draftId: string): RecipeDraft | null {
  const draft = getDraftById(draftId);
  if (!draft) return null;
  return saveDraft({
    ...draft,
    ingredients: structuredClone(draft.originalIngredients),
  });
}

export function deleteDraft(id: string): boolean {
  const drafts = getDraftsFromStorage();
  if (!drafts[id]) return false;
  delete drafts[id];
  saveDraftsToStorage(drafts);
  return true;
}

export function isDraftId(id: string): boolean {
  return id.startsWith("draft_");
}

export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear drafts from localStorage", e);
  }
}
