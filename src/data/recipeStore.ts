import getClientPromise from "@/lib/mongodb";
import { Recipe } from "@/types/recipe";
import { ObjectId, WithId } from "mongodb";

const DB_NAME = process.env.MONGODB_DB ?? "recipe_lab";
const COLLECTION_NAME = "recipes";

export type RecipeInput = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

type RecipeDocument = RecipeInput & {
  createdAt: string;
  updatedAt: string;
};

async function getCollection() {
  const client = await getClientPromise();
  return client.db(DB_NAME).collection<RecipeDocument>(COLLECTION_NAME);
}

function mapDocument(doc: WithId<RecipeDocument>): Recipe {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toHexString(),
  };
}

function toObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const collection = await getCollection();
  const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(mapDocument);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: objectId });
  return doc ? mapDocument(doc) : null;
}

export async function addRecipe(recipe: RecipeInput): Promise<Recipe> {
  const collection = await getCollection();
  const now = new Date().toISOString();
  const document: RecipeDocument = {
    ...recipe,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return {
    ...document,
    id: result.insertedId.toHexString(),
  };
}

export async function updateRecipe(
  id: string,
  updates: RecipeInput
): Promise<Recipe | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  const collection = await getCollection();
  const now = new Date().toISOString();

  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: { ...updates, updatedAt: now } },
    { returnDocument: "after" }
  );

  return result ? mapDocument(result) : null;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  const collection = await getCollection();
  
  const result = await collection.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}
