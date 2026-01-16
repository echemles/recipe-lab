"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const NOT_FOUND_ILLUSTRATIONS = [
  "grocery-bag.png",
  "bag-with-bread.png",
  "bag-with-beans.png",
  "jar-with-rice.png",
  "sack-with-pasta.png",
];
import {
  getDraftById,
  deleteDraft,
  RecipeDraft,
} from "@/lib/draftStore";
import { RecipeEditor, RecipeInput } from "@/components/recipe/RecipeEditor";
import { MacroInformation } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DraftEditPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;

  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftMacros, setDraftMacros] = useState<MacroInformation | null>(null);

  useEffect(() => {
    const loaded = getDraftById(draftId);
    setDraft(loaded);
    setLoading(false);
  }, [draftId]);

  useEffect(() => {
    if (!draft || !draft.ingredients || draft.ingredients.length === 0) {
      setDraftMacros(null);
      return;
    }

    // Calculate macros for the draft
    const calculateDraftMacros = async () => {
      try {
        const response = await fetch('/api/estimate-macros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: draft.ingredients,
            servings: draft.servings || 1
          })
        });

        if (response.ok) {
          const macrosData = await response.json() as MacroInformation & { _fallback?: boolean };
          setDraftMacros({
            calories: macrosData.calories,
            protein: macrosData.protein,
            carbohydrates: macrosData.carbohydrates,
            fat: macrosData.fat,
            fiber: macrosData.fiber,
            sugar: macrosData.sugar,
            sodium: macrosData.sodium,
            cholesterol: macrosData.cholesterol,
            saturatedFat: macrosData.saturatedFat,
            unsaturatedFat: macrosData.unsaturatedFat,
          });
        }
      } catch (error) {
        console.error('Failed to calculate macros:', error);
        setDraftMacros(null);
      }
    };

    calculateDraftMacros();
  }, [draft?.ingredients, draft?.servings]);

  const handleSave = async (recipeData: RecipeInput) => {
    setSaving(true);
    try {
      const payload = {
        ...recipeData,
        macros: draftMacros,
        isDraft: true,
      };
      
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to save recipe");
      const data = await res.json();
      deleteDraft(draftId);
      
      // Handle different response formats
      const recipeId = data.recipe?.id || data.id;
      if (!recipeId) {
        throw new Error("No recipe ID returned from save operation");
      }
      router.push(`/recipe/${recipeId}`);
    } catch (err) {
      console.error("Save error:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      return;
    }
    
    deleteDraft(draftId);
    router.push("/recipes/ai-add");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4 sm:px-0">
        <p className="text-muted">Loading draft...</p>
      </main>
    );
  }

  if (!draft) {
    const randomIllustration = NOT_FOUND_ILLUSTRATIONS[Math.floor(Math.random() * NOT_FOUND_ILLUSTRATIONS.length)];
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-16 px-6">
        <div className="flex flex-col items-center gap-8 max-w-md">
          {/* Watercolor illustration - above text with blur animation */}
          <div className="w-[280px] h-[280px] flex items-center justify-center">
            <img 
              src={`/illustrations/${randomIllustration}`}
              alt="" 
              className="w-full h-full object-contain animate-[blur-to-final_3s_ease-out_forwards]"
            />
          </div>
          
          <Card className="p-8 w-full text-center">
            <div className="mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Draft Not Found</h1>
            <p className="text-muted mb-6">The draft you're looking for doesn't exist or has been deleted.</p>
            <Link href="/recipes/ai-add">
              <Button variant="secondary">Create New Recipe</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  // Convert draft to recipe format for the editor
  const recipeForEditor = {
    id: draft.id,
    title: draft.title,
    description: draft.description,
    ingredients: draft.ingredients,
    steps: draft.steps,
    prepTimeMinutes: draft.prepTimeMinutes,
    cookTimeMinutes: draft.cookTimeMinutes,
    servings: draft.servings,
    tags: draft.tags,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  };

  return (
    <RecipeEditor
      initialRecipe={recipeForEditor}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
      saveButtonText="Save to Recipes"
      title="Edit Draft"
      description="Edit your recipe draft before saving"
      loading={saving}
    />
  );
}
