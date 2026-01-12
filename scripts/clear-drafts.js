// Script to clear all draft recipes from localStorage
// Run this in the browser console or as part of your app

import { clearAllDrafts } from './src/lib/draftStore.js';

// Clear all drafts
clearAllDrafts();

console.log('All draft recipes have been cleared from localStorage.');
