import { NextResponse } from "next/server";
import { addRecipe, getAllRecipes, RecipeInput } from "@/data/recipeStore";
import { searchPhotos } from "@/lib/unsplash";
import { toRecipeImage } from "@/types/recipe-image";

export async function GET() {
  const recipes = await getAllRecipes();
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RecipeInput;

  if (!payload.title?.trim() || !payload.description?.trim()) {
    return NextResponse.json(
      { message: "Title and description are required." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.ingredients) || payload.ingredients.length === 0) {
    return NextResponse.json(
      { message: "At least one ingredient is required." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
    return NextResponse.json(
      { message: "At least one step is required." },
      { status: 400 }
    );
  }

  const recipeWithImage = await ensureRecipeHasImage(payload);
  const created = await addRecipe(recipeWithImage);
  return NextResponse.json(created, { status: 201 });
}

const UNSPLASH_UTM_SOURCE = "recipe-lab";

async function ensureRecipeHasImage(recipe: RecipeInput): Promise<RecipeInput> {
  if (recipe.images?.length) {
    return recipe;
  }

  const fallbackQueries = [
    recipe.title?.trim(),
    recipe.description?.split(".")[0]?.trim(),
    recipe.ingredients[0]?.name,
  ].filter((value): value is string => Boolean(value && value.length >= 2));

  const query = fallbackQueries[0];
  if (!query) {
    return recipe;
  }

  try {
    const response = await searchPhotos({
      query,
      perPage: 1,
      orientation: "landscape",
    });

    const photo = response.results[0];
    if (!photo) {
      return recipe;
    }

    const recipeImage = toRecipeImage(
      {
        id: photo.id,
        alt_description: photo.alt_description,
        urls: {
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full,
        },
        user: {
          name: photo.user.name,
          username: photo.user.username,
        },
        links: {
          html: photo.links.html,
        },
      },
      UNSPLASH_UTM_SOURCE
    );

    return {
      ...recipe,
      images: [recipeImage],
    };
  } catch (error) {
    console.error("[recipes-api] Failed to fetch Unsplash image:", error);
    return recipe;
  }
}
