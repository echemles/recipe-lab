"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ingredient, Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { IngredientListBuilder } from "@/components/recipe/IngredientListBuilder";
import { StepsListBuilder } from "@/components/recipe/StepsListBuilder";

type EditRecipePageProps = {
  params: {
    recipeNumber: string;
  };
};

export default function EditRecipePage({ params }: EditRecipePageProps) {
  const router = useRouter();
  const { recipeNumber } = params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [tags, setTags] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { quantity: 0, unit: "", name: "" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]); 

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await fetch(`/api/recipes/${recipeNumber}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message ?? "Recipe not found.");
        }
        const existing: Recipe = await response.json();
        setRecipe(existing);
        setTitle(existing.title);
        setDescription(existing.description);
        setPrepTime(existing.prepTimeMinutes?.toString() ?? "");
        setCookTime(existing.cookTimeMinutes?.toString() ?? "");
        setServings(existing.servings?.toString() ?? "");
        setTags((existing.tags ?? []).join(", "));
        setIngredients(existing.ingredients.length ? existing.ingredients : [{ quantity: 0, unit: "", name: "" }]);
        setSteps(existing.steps.length ? existing.steps : [""]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [recipeNumber]);

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

    if (!recipe) {
      setError("Recipe not loaded.");
      return;
    }

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
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
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
        throw new Error(body?.message ?? "Failed to update recipe.");
      }

      router.push(`/recipe/${recipe.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update recipe.");
    }
  }

  const handleDelete = async () => {
    if (!recipe) return;
    
    if (!confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to delete recipe.");
      }

      router.push("/recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16">
        <p className="text-muted">Loading recipe...</p>
      </main>
    );
  }

  if (error && !recipe) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Recipe</h1>
          <p className="text-muted">Update your recipe details</p>
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
              <p className="text-sm text-muted">Recipe name and description</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="title">
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
                  className="block text-sm font-medium mb-1"
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
                    className="block text-sm font-medium mb-1"
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
                    className="block text-sm font-medium mb-1"
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
                    className="block text-sm font-medium mb-1"
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
                <label className="block text-sm font-medium mb-1" htmlFor="tags">
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
            <Button
              type="submit"
              variant="primary"
              className="flex-1 sm:flex-initial"
              data-testid="save-button"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/recipe/${recipe?.id ?? recipeNumber}`)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              data-testid="delete-button"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
