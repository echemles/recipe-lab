import getClientPromise from "@/lib/mongodb";
import { GroceryItem, GroceryItemInput } from "@/types/grocery";
import { ObjectId, WithId } from "mongodb";

const isTestDatabase =
  process.env.NODE_ENV === "test" || process.env.PLAYWRIGHT_TEST === "true";

const DEFAULT_DB = process.env.MONGODB_DB ?? "recipe_lab";

const DB_NAME = isTestDatabase
  ? process.env.MONGODB_DB_TEST || `${DEFAULT_DB}_test`
  : DEFAULT_DB;
const COLLECTION_NAME = "grocery_items";

type GroceryDocument = Omit<GroceryItem, "id"> & {
  createdAt: string;
  updatedAt: string;
};

async function getCollection() {
  const client = await getClientPromise();
  return client.db(DB_NAME).collection<GroceryDocument>(COLLECTION_NAME);
}

function mapDocument(doc: WithId<GroceryDocument>): GroceryItem {
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

export async function getAllGroceryItems(): Promise<GroceryItem[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({})
    .sort({ isPurchased: 1, createdAt: -1 })
    .toArray();
  return docs.map(mapDocument);
}

export async function addGroceryItem(
  item: GroceryItemInput
): Promise<GroceryItem> {
  const collection = await getCollection();
  const now = new Date().toISOString();
  const document: GroceryDocument = {
    ...item,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return {
    ...document,
    id: result.insertedId.toHexString(),
  };
}

export async function addGroceryItems(
  items: GroceryItemInput[]
): Promise<GroceryItem[]> {
  if (items.length === 0) return [];
  
  const collection = await getCollection();
  const now = new Date().toISOString();
  const documents: GroceryDocument[] = items.map((item) => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));
  
  const result = await collection.insertMany(documents);
  
  return documents.map((doc, index) => ({
    ...doc,
    id: result.insertedIds[index].toHexString(),
  }));
}

export async function updateGroceryItem(
  id: string,
  updates: Partial<GroceryItemInput>
): Promise<GroceryItem | null> {
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

export async function deleteGroceryItem(id: string): Promise<boolean> {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}

export async function findExistingGroceryItem(
  ingredientName: string
): Promise<GroceryItem | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({
    ingredientName: { $regex: new RegExp(`^${ingredientName}$`, "i") },
    isPurchased: false,
  });
  return doc ? mapDocument(doc) : null;
}

export async function clearPurchasedItems(): Promise<number> {
  const collection = await getCollection();
  const result = await collection.deleteMany({ isPurchased: true });
  return result.deletedCount;
}
