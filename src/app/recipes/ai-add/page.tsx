"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FoodLoadingAnimation } from "@/components/recipe/FoodLoadingAnimation";

type CreatedRecipeResponse = {
  recipe: Recipe;
};

type RecipeDraft = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

const LOADING_MESSAGES = [
  "Composing flavors with quiet precision.",
  "Layering textures for perfect balance.",
  "Curating ingredients to suit your brief.",
  "Refining steps for a graceful flow.",
  "Tasting every detail before the reveal.",
];

function getRandomLoadingMessage() {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

const COOKING_MODES = {
  beginner: {
    title: "Beginner Friendly",
    description: "Simple steps, familiar ingredients, minimal techniques",
    icon: "🌱",
    defaultIntensity: 2,
    baseConstraints: {
      techniqueComplexity: "very low",
      allowedVariations: "none",
      specialtyIngredients: false,
      guidanceLevel: "very high"
    }
  },
  traditional: {
    title: "Traditional & Authentic",
    description: "Classic methods and ingredients, cooked the proper way",
    icon: "👨‍🍳",
    defaultIntensity: 3,
    baseConstraints: {
      techniqueComplexity: "medium",
      allowedVariations: "limited",
      specialtyIngredients: false,
      guidanceLevel: "high"
    }
  },
  weeknight: {
    title: "Weeknight Quick",
    description: "Efficient techniques for faster, everyday cooking",
    icon: "⚡",
    defaultIntensity: 3,
    baseConstraints: {
      techniqueComplexity: "low-medium",
      allowedVariations: "limited",
      specialtyIngredients: false,
      guidanceLevel: "medium"
    }
  },
  chef: {
    title: "Chef Mode",
    description: "Layered flavors and more advanced techniques",
    icon: "🎯",
    defaultIntensity: 4,
    baseConstraints: {
      techniqueComplexity: "high",
      allowedVariations: "moderate",
      specialtyIngredients: true,
      guidanceLevel: "medium"
    }
  },
  experimental: {
    title: "Experimental",
    description: "Creative variations, bold ideas, and less conventional choices",
    icon: "🔬",
    defaultIntensity: 3,
    baseConstraints: {
      techniqueComplexity: "variable",
      allowedVariations: "high",
      specialtyIngredients: true,
      guidanceLevel: "low"
    }
  }
} as const;

type CookingMode = keyof typeof COOKING_MODES;

export default function AiAddRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pantryInput, setPantryInput] = useState("");
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [cookingMode, setCookingMode] = useState<CookingMode>("beginner");
  const [highProtein, setHighProtein] = useState(false);
  const [quickMeal, setQuickMeal] = useState(false);
  const [lowCalorie, setLowCalorie] = useState(false);
  const [mealPrepFriendly, setMealPrepFriendly] = useState(false);
  const [lowCost, setLowCost] = useState(false);
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [lowCarb, setLowCarb] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [spicy, setSpicy] = useState(false);
  const [allergensExpanded, setAllergensExpanded] = useState(false);
  const [allergens, setAllergens] = useState({
    dairy: false,
    egg: false,
    peanut: false,
    treeNuts: false,
    wheat: false,
    soy: false,
    fish: false,
    shellfish: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<'loading' | 'error'>('loading');
  const [loadingMessage, setLoadingMessage] = useState("");
  const [modalError, setModalError] = useState("");


  function handleAddPantryItem() {
    const trimmed = pantryInput.trim();
    if (!trimmed) return;
    
    // Split by comma and process each item
    const items = trimmed.split(',').map(item => item.trim()).filter(item => item);
    const newItems = items.filter(item => !pantryItems.includes(item));
    
    if (newItems.length > 0) {
      setPantryItems([...pantryItems, ...newItems]);
    }
    setPantryInput("");
  }

  function handleRemovePantryItem(item: string) {
    setPantryItems(pantryItems.filter((i) => i !== item));
  }

  function handlePantryKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPantryItem();
    }
  }

  function handlePantryBlur() {
    handleAddPantryItem();
  }

  function handleCookingModeChange(mode: CookingMode) {
    setCookingMode(mode);
  }

  function handleCookingModeKeyDown(e: React.KeyboardEvent, currentMode: CookingMode) {
    const modes = Object.keys(COOKING_MODES) as CookingMode[];
    const currentIndex = modes.indexOf(currentMode);
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % modes.length;
        setCookingMode(modes[nextIndex]);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
        setCookingMode(modes[prevIndex]);
        break;
    }
  }

  function buildGenerationPayload() {
    const selectedMode = COOKING_MODES[cookingMode];
    
    return {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      pantryItems,
      cookingMode,
      constraints: selectedMode.baseConstraints,
      preferences: {
        highProtein,
        quickMeal,
        lowCalorie,
        mealPrepFriendly,
        lowCost,
        budgetFriendly,
        lowCarb,
        glutenFree,
        vegetarian,
        vegan,
        spicy,
      },
      allergens: Object.entries(allergens)
        .filter(([_, checked]) => checked)
        .map(([name]) => name),
    };
  }

  async function generateRecipeFromInputs() {
    const payload = buildGenerationPayload();
    console.log("Generating recipe with payload:", payload);
    
    // Open modal with loading state
    setIsModalOpen(true);
    setModalState('loading');
    setLoadingMessage(getRandomLoadingMessage());
    setModalError("");
    
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      const data = await response.json().catch(() => ({}));
      console.log("Response data:", data);
      
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to generate recipe.");
      }

      const recipe = data as RecipeDraft;
      console.log("Generated recipe:", recipe);
      
      // Redirect to AI preview page with recipe data
      const recipeData = encodeURIComponent(JSON.stringify(recipe));
      console.log("AI add page - redirecting with data:", recipeData.substring(0, 200) + "...");
      router.push(`/recipes/ai-preview?recipe=${recipeData}`);
      
    } catch (err) {
      console.error("Generation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate recipe.";
      setModalError(errorMessage);
      setModalState('error');
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Form submitted", { description, pantryItems });
    setError("");
    setSuccessMessage("");
    setCreatedRecipe(null);

    // Add any remaining pantry input text before submission
    const trimmed = pantryInput.trim();
    if (trimmed) {
      // Split by comma and process each item
      const items = trimmed.split(',').map(item => item.trim()).filter(item => item);
      const newItems = items.filter(item => !pantryItems.includes(item));
      if (newItems.length > 0) {
        setPantryItems([...pantryItems, ...newItems]);
      }
      setPantryInput("");
    }

    if (!description.trim() && pantryItems.length === 0) {
      setError("Provide a recipe description or at least one pantry item.");
      return;
    }

    await generateRecipeFromInputs();
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setModalState('loading');
    setLoadingMessage("");
    setModalError("");
  }

  function handleRetryGenerate() {
    generateRecipeFromInputs();
  }

  const handleCancelGeneration = () => {
    // Allow cancel at any time during generation
    handleCloseModal();
  };

  return (
    <main className="flex min-h-screen flex-col items-center pt-24 pb-16 px-4 sm:px-0 relative overflow-hidden">
      {/* Watercolor illustration - atmospheric background element */}
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none select-none"
        aria-hidden="true"
      >
        <img 
          src="/illustrations/bag-with-bokchoy.png" 
          alt="" 
          className="w-full h-full object-contain opacity-[0.16] blur-sm"
        />
      </div>
      
      <div className="w-full max-w-3xl space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2"><span className="font-caveat text-4xl sm:text-5xl">AI Recipe Generator</span></h1>
            <p className="text-muted">Describe what you want, and AI will create a complete recipe</p>
          </div>
          <Link href="/recipes">
            <Button variant="secondary" size="sm">Back to Recipes</Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-[--radius-input] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="rounded-[--radius-input] bg-accent/10 dark:bg-accent/20 border border-accent/30 p-4 text-accent-foreground">
            {successMessage}{" "}
            {createdRecipe && (
              <Link
                className="underline font-semibold"
                href={`/recipe/${createdRecipe.id}`}
              >
                View recipe →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[0.1rem] mb-1">Ingredients You Have</h2>
              <p className="text-sm text-muted">Tell the AI what's in your pantry (optional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="pantryInput">
                Add Pantry Items
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="pantryInput"
                  type="text"
                  className="flex-1"
                  placeholder="e.g. canned tuna, eggs"
                  value={pantryInput}
                  onChange={(e) => setPantryInput(e.target.value)}
                  onKeyDown={handlePantryKeyDown}
                  onBlur={handlePantryBlur}
                />
                <Button
                  type="button"
                  onClick={handleAddPantryItem}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
            </div>

            {pantryItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-[--radius-input] bg-accent/10 border border-accent/20 px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemovePantryItem(item)}
                      className="hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Remove item"
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

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">What would you like to make?</h2>
              <p className="text-sm text-muted mb-4">Give the AI a starting point for your recipe</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="description">
                Recipe Description *
              </label>
              <p className="text-xs text-muted mb-1">
                Describe the dish, flavor profile, or cooking style you want
              </p>
              <Textarea
                id="description"
                rows={4}
                placeholder="e.g. A light pasta with fresh vegetables and citrus notes, perfect for spring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="title">
                Would you like to name this recipe? (Optional)
              </label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Citrus Pasta Primavera"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[0.1rem] mb-1">Flavor & Preferences</h2>
              <p className="text-sm text-muted">Customize the recipe to your taste</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 tracking-[0.005em]">
                Cooking Mode
              </label>
              <p className="text-xs text-muted mb-4">
                Choose how the recipe should be structured and guided.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="radiogroup">
                {Object.entries(COOKING_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCookingModeChange(key as CookingMode)}
                    onKeyDown={(e) => handleCookingModeKeyDown(e, key as CookingMode)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer
                      ${cookingMode === key 
                        ? 'border-accent bg-accent/10 shadow-md transform scale-[1.03]' 
                        : 'border-border bg-surface-1/50 hover:bg-surface-2 hover:border-accent/50 hover:shadow-md hover:transform hover:scale-[1.02] hover:-translate-y-1'
                      }
                      focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2
                    `}
                    role="radio"
                    aria-checked={cookingMode === key}
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{mode.icon}</span>
                      <div className="font-medium text-sm">{mode.title}</div>
                    </div>
                    <div className="text-xs text-muted leading-relaxed">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 tracking-[0.005em]">
                Additional Preferences (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={highProtein}
                    onChange={(e) => setHighProtein(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">High Protein</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={quickMeal}
                    onChange={(e) => setQuickMeal(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Quick Meal (≤30 min)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCarb}
                    onChange={(e) => setLowCarb(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Low-Carb</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={glutenFree}
                    onChange={(e) => setGlutenFree(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Gluten-Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={vegetarian}
                    onChange={(e) => setVegetarian(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={vegan}
                    onChange={(e) => setVegan(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Vegan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={spicy}
                    onChange={(e) => setSpicy(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Spicy</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCalorie}
                    onChange={(e) => setLowCalorie(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Low Calorie</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={mealPrepFriendly}
                    onChange={(e) => setMealPrepFriendly(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Meal-Prep Friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCost}
                    onChange={(e) => setLowCost(e.target.checked)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">Low Cost</span>
                </label>
              </div>
            </div>

            {/* Allergens Section */}
            <div>
              <button
                type="button"
                onClick={() => setAllergensExpanded(!allergensExpanded)}
                className="flex items-center gap-2 text-sm font-medium mb-3 tracking-[0.005em] hover:text-accent transition-colors"
                aria-expanded={allergensExpanded}
              >
                <span className="text-lg">{allergensExpanded ? '−' : '+'}</span>
                Dietary Restrictions & Allergens (Optional)
              </button>
              
              {allergensExpanded && (
                <div className="bg-surface-1/50 rounded-lg p-4 border border-border/50">
                  <p className="text-xs text-muted mb-3">
                    Select any allergens to avoid. The AI will ensure ingredients are safe for your dietary needs.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.dairy}
                        onChange={(e) => setAllergens(prev => ({ ...prev, dairy: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Dairy</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.egg}
                        onChange={(e) => setAllergens(prev => ({ ...prev, egg: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Egg</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.peanut}
                        onChange={(e) => setAllergens(prev => ({ ...prev, peanut: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Peanut</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.treeNuts}
                        onChange={(e) => setAllergens(prev => ({ ...prev, treeNuts: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Tree Nuts (walnut, almond, cashew, etc.)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.wheat}
                        onChange={(e) => setAllergens(prev => ({ ...prev, wheat: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Wheat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.soy}
                        onChange={(e) => setAllergens(prev => ({ ...prev, soy: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Soy</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.fish}
                        onChange={(e) => setAllergens(prev => ({ ...prev, fish: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Fish</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                      <input
                        type="checkbox"
                        data-checkbox-type="allergen"
                        checked={allergens.shellfish}
                        onChange={(e) => setAllergens(prev => ({ ...prev, shellfish: e.target.checked }))}
                        className="pointer-events-none"
                      />
                      <span className="text-sm">Shellfish</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              className="w-full text-lg py-3"
            >
              {submitting ? "✨ Generating Recipe..." : "✨ Generate & Save Recipe"}
            </Button>
            <p className="text-xs text-muted text-center mt-2">
              AI will create a complete recipe with ingredients and instructions
            </p>
          </div>
        </form>

        {createdRecipe && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✨</span>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Generated Recipe
                </p>
              </div>
              <h2 className="text-2xl font-bold">{createdRecipe.title}</h2>
            </div>
            <p className="text-muted mb-6">{createdRecipe.description}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  Ingredients
                </h3>
                <ul className="mt-2 list-disc pl-5">
                  {createdRecipe.ingredients.slice(0, 8).map((ing, idx) => (
                    <li key={`${ing.name}-${idx}`}>
                      {ing.quantity ? `${ing.quantity} ` : ""}
                      {ing.unit ? `${ing.unit} ` : ""}
                      {ing.name}
                    </li>
                  ))}
                  {createdRecipe.ingredients.length > 8 && (
                    <li className="text-sm text-muted">
                      +{createdRecipe.ingredients.length - 8} more
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  Steps
                </h3>
                <ol className="mt-2 list-decimal pl-5">
                  {createdRecipe.steps.slice(0, 4).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                  {createdRecipe.steps.length > 4 && (
                    <li className="text-sm text-muted">
                      + more steps in the full recipe
                    </li>
                  )}
                </ol>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              {createdRecipe.prepTimeMinutes && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Prep: {createdRecipe.prepTimeMinutes} min
                </span>
              )}
              {createdRecipe.cookTimeMinutes && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Cook: {createdRecipe.cookTimeMinutes} min
                </span>
              )}
              {createdRecipe.servings && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Serves {createdRecipe.servings}
                </span>
              )}
              {(createdRecipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[--radius-input] bg-accent/10 text-accent px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recipe Generation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancelGeneration} 
        size="lg" 
        ariaLabel="Recipe Generation"
        disableBackdropClose={true}
        disableEscapeClose={false}
      >
        {modalState === 'loading' && (
          <div className="text-center py-8 sm:py-12">
            <FoodLoadingAnimation
              size="lg"
              message={loadingMessage || "Composing your custom recipe..."}
              className="mx-auto"
            />
            <h2 className="text-xl font-semibold mt-6 mb-2 tracking-tight">
              Generating Your Recipe
            </h2>
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelGeneration}
                className="min-w-[120px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {modalState === 'error' && (
          <div className="text-center py-6 sm:py-8">
            <div className="mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl">⚠️</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Generation Error</h2>
            <p className="text-muted mb-4 sm:mb-6 text-sm sm:text-base">{modalError || "Failed to generate recipe. Please try again."}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetryGenerate} variant="primary">
                Try Again
              </Button>
              <Button onClick={handleCloseModal} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
