"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { IngredientListBuilder } from "@/components/recipe/IngredientListBuilder";
import { StepsListBuilder } from "@/components/recipe/StepsListBuilder";

export default function AddRecipePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [tags, setTags] = useState("");

  // Ingredients as array of partial objects
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { quantity: 0, unit: "", name: "" },
  ]);

  // Steps as array of strings
  const [steps, setSteps] = useState<string[]>([""]);

  const [error, setError] = useState("");

  function handleAddIngredient() {
    setIngredients([...ingredients, { quantity: 0, unit: "", name: "" }]);
  }

  function handleRemoveIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function handleIngredientChange(
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  }

  function handleAddStep() {
    setSteps([...steps, ""]);
  }

  function handleRemoveStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  function handleStepChange(index: number, value: string) {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity > 0 && ing.unit.trim()
    );
    if (validIngredients.length === 0) {
      setError("At least one valid ingredient is required.");
      return;
    }
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      setError("At least one step is required.");
      return;
    }

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          ingredients: validIngredients,
          steps: validSteps,
          prepTimeMinutes: prepTime ? parseInt(prepTime, 10) : undefined,
          cookTimeMinutes: cookTime ? parseInt(cookTime, 10) : undefined,
          servings: servings ? parseInt(servings, 10) : undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to save recipe.");
      }

      router.push("/recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Add Recipe</h1>
          <p className="text-muted">Share your culinary creation with the community</p>
        </div>

        {error && (
          <div className="mb-6 rounded-[--radius-input] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="recipe-form">
          {/* Basic Information Section */}
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold mb-1">Basic Information</h2>
              <p className="text-sm text-muted">Give your recipe a name and description</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="title">
                  Recipe Title *
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Grandma's Chocolate Chip Cookies"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="title-input"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 tracking-[0.005em]"
                  htmlFor="description"
                >
                  Description *
                </label>
                <p className="text-xs text-muted mb-1">What makes this recipe special?</p>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Share what makes this recipe unique, its origin, or why you love it..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Recipe Details Section */}
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold mb-1">Recipe Details</h2>
              <p className="text-sm text-muted">Timing, servings, and categories</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1 tracking-[0.005em]"
                    htmlFor="prepTime"
                  >
                    Prep Time
                  </label>
                  <Input
                    id="prepTime"
                    type="number"
                    min={0}
                    placeholder="minutes"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1 tracking-[0.005em]"
                    htmlFor="cookTime"
                  >
                    Cook Time
                  </label>
                  <Input
                    id="cookTime"
                    type="number"
                    min={0}
                    placeholder="minutes"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1 tracking-[0.005em]"
                    htmlFor="servings"
                  >
                    Servings
                  </label>
                  <Input
                    id="servings"
                    type="number"
                    min={1}
                    placeholder="people"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="tags">
                  Tags
                </label>
                <p className="text-xs text-muted mb-1">Help others discover your recipe</p>
                <Input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. pasta, vegetarian, quick, comfort-food"
                />
              </div>
            </div>
          </Card>

          {/* Ingredients Section */}
          <Card className="p-6">
            <IngredientListBuilder
              ingredients={ingredients}
              onChange={handleIngredientChange}
              onAdd={handleAddIngredient}
              onRemove={handleRemoveIngredient}
            />
          </Card>

          {/* Instructions Section */}
          <Card className="p-6">
            <StepsListBuilder
              steps={steps}
              onChange={handleStepChange}
              onAdd={handleAddStep}
              onRemove={handleRemoveStep}
            />
          </Card>

          {/* Submit Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" className="flex-1 sm:flex-initial" data-testid="save-button">
              Save Recipe
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/recipes")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
