"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addRecipe } from "@/data/recipeStore";
import { Ingredient } from "@/types/recipe";

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

  function handleSubmit(e: React.FormEvent) {
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

    addRecipe({
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
    });

    router.push("/recipes");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Add Recipe</h1>

        {error && (
          <p className="mb-4 rounded-md bg-red-100 p-3 text-red-800">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Prep / Cook / Servings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="prepTime"
              >
                Prep Time (min)
              </label>
              <input
                id="prepTime"
                type="number"
                min={0}
                className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="cookTime"
              >
                Cook Time (min)
              </label>
              <input
                id="cookTime"
                type="number"
                min={0}
                className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
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
              <input
                id="servings"
                type="number"
                min={1}
                className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="tags">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              className="w-full rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. pasta, vegetarian, quick"
            />
          </div>

          {/* Ingredients */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-1">Ingredients</legend>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Qty"
                  className="w-20 rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
                  value={ing.quantity || ""}
                  onChange={(e) =>
                    handleIngredientChange(
                      idx,
                      "quantity",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Unit"
                  className="w-20 rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
                  value={ing.unit}
                  onChange={(e) =>
                    handleIngredientChange(idx, "unit", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Ingredient name"
                  className="flex-1 rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
                  value={ing.name}
                  onChange={(e) =>
                    handleIngredientChange(idx, "name", e.target.value)
                  }
                />
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveIngredient(idx)}
                  aria-label="Remove ingredient"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={handleAddIngredient}
            >
              + Add ingredient
            </button>
          </fieldset>

          {/* Steps */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium mb-1">Steps</legend>
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-500 w-6">{idx + 1}.</span>
                <input
                  type="text"
                  placeholder="Step description"
                  className="flex-1 rounded-md border border-gray-300 p-2 bg-gray-50 text-gray-900"
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveStep(idx)}
                  aria-label="Remove step"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={handleAddStep}
            >
              + Add step
            </button>
          </fieldset>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              Save Recipe
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100 transition-colors"
              onClick={() => router.push("/recipes")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
