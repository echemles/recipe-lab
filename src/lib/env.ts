/**
 * Runtime environment variable validation.
 * Throws clear errors if required server-side variables are missing.
 */

export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `Please add it to your .env.local file and restart the server.\n` +
      `See .env.example for reference.`
    );
  }
  return value;
}

/**
 * Server-side environment variables.
 * These are only available on the server and will throw if accessed on the client.
 */
export const env = {
  // MongoDB
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  MONGODB_DB: process.env.MONGODB_DB ?? 'recipe_lab',
  MONGODB_URI_TEST: getEnvVar('MONGODB_URI_TEST'),
  MONGODB_DB_TEST: process.env.MONGODB_DB_TEST ?? 'recipe_lab_test',

  // OpenAI
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  OPENAI_RECIPE_MODEL: process.env.OPENAI_RECIPE_MODEL ?? 'gpt-4o-mini',

  // Unsplash (server-side only)
  UNSPLASH_ACCESS_KEY: getEnvVar('UNSPLASH_ACCESS_KEY'),
} as const;

// Type assertion to ensure no client-side access
type ServerEnv = typeof env;
declare global {
  var __server_env__: ServerEnv | undefined;
}
