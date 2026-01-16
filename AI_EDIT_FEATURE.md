# AI Edit Recipe Feature - Implementation Documentation

## Overview
The AI Edit Recipe feature provides a safe, professional AI-assisted editing workflow that allows users to propose changes to existing recipes and regenerate them with AI assistance. All changes are non-destructive until explicitly applied.

## Architecture

### Pages
- **`/recipe/[recipeNumber]/ai-edit/page.tsx`**: Main AI Edit page with complete workflow management

### Components
All components are located in `/src/components/recipe/ai-edit/`:

1. **`AIEditPanel.tsx`**: Main control panel for proposing changes
2. **`IngredientSubstitution.tsx`**: Interface for substituting ingredients
3. **`IngredientDeletion.tsx`**: Interface for removing ingredients
4. **`MacroDirectionControl.tsx`**: Directional macro adjustments (Increase/Neutral/Decrease)
5. **`QuickIntentsControl.tsx`**: Quick flavor/texture adjustments
6. **`ProposedChangesSummary.tsx`**: Live summary of all proposed changes
7. **`CandidatePreview.tsx`**: Preview of regenerated recipe with tabs

### API Endpoint
- **`/api/recipes/[recipeId]/ai-regenerate/route.ts`**: Handles AI regeneration requests

## State Management

The page maintains three distinct recipe states:

1. **`lastSavedRecipe`**: Snapshot from server (immutable reference)
2. **`editableRecipe`**: Current working state (can be modified)
3. **`candidateRecipe`**: AI-regenerated version (preview only)

## User Workflow

### 1. Propose Changes
Users can configure:
- **Ingredient Substitutions**: Replace ingredients (with or without specifying replacement)
- **Ingredient Deletions**: Remove ingredients completely
- **Macro Direction**: Increase/Decrease/Neutral for Protein/Carbs/Fat
- **Quick Intents**: Crispier, Saucier, Brighter, Less Salty
- **Constraints**: Prefer local, avoid specialty ingredients, maintain dish integrity
- **Locks**: Lock ingredients to prevent AI from changing them
- **Notes**: Free-form instructions for AI

### 2. Regenerate Recipe
- Click "Regenerate Recipe" to send proposed changes to AI
- Loading state with accessibility announcements
- Candidate recipe is stored separately and previewed

### 3. Preview Candidate
- View regenerated ingredients and instructions in tabbed interface
- Compare with original recipe (displayed above)
- Badges show which changes were applied

### 4. Apply or Revert
- **Apply**: Writes candidate values into editable recipe (non-destructive, requires Save)
- **Revert**: Restores recipe to last saved state (with confirmation if unsaved changes exist)
- **Save Changes**: Persists editable recipe to database

## API Contract

### Request Payload
```typescript
{
  originalRecipe: Recipe,
  locationHint: { country?, city?, locale? } | null,
  constraints: {
    preferLocal: boolean,
    avoidSpecialtyIngredients: boolean,
    maintainDishIntegrity: boolean
  },
  locks: {
    lockedIngredientIds: string[]
  },
  changes: {
    substitutions: [{ fromIngredientId: string, toText?: string | null }],
    deletions: [{ ingredientId: string }]
  },
  macroDirection: {
    protein: "down" | "neutral" | "up",
    carbs: "down" | "neutral" | "up",
    fat: "down" | "neutral" | "up",
    magnitude?: "small" | "medium" | "large"
  },
  quickIntents: Array<"crispier" | "saucier" | "brighter" | "less_salty">,
  notes: string
}
```

### Response
Returns a complete `Recipe` object with regenerated fields.

## AI Rules (Enforced in Prompt)

1. **Deleted ingredients MUST NOT appear** in candidate (including synonyms)
2. **Locked ingredients MUST remain unchanged** (name, quantity, unit)
3. **Blank "Replace with"** → AI chooses local/common replacement
4. **Macro directions** are applied directionally (no exact gram targets)
5. **Maintain recipe coherence** and culinary logic

## Accessibility Features

### Keyboard Navigation
- All controls are keyboard accessible
- Tab order follows logical flow
- Arrow keys navigate radio groups (macro direction)
- Enter/Space activate buttons and toggles

### ARIA Labels
- `role="radiogroup"` for macro direction controls
- `role="radio"` with `aria-checked` for individual options
- `role="tab"` and `role="tabpanel"` for candidate preview
- `aria-pressed` for toggle buttons (locks, quick intents)
- `aria-live="polite"` for regeneration success announcements
- Descriptive labels for all form controls

### Focus Management
- Modal focus trap on revert confirmation
- Focus restoration after modal close
- Clear focus indicators on all interactive elements

## Mobile Responsiveness

- Mobile-first design with responsive breakpoints
- Stacked layouts on small screens
- Touch-friendly button sizes
- Collapsible sections where appropriate

## Error Handling

### Validation Errors
- Locked ingredient substitution/deletion → Inline error message
- Empty selections → User-friendly prompts

### API Errors
- Network failures → Error banner with retry option
- AI model errors → Graceful degradation with error message
- JSON parsing errors → Logged and user-notified

## Design Tokens

Follows existing design system:
- `--radius-input`, `--radius-card`, `--radius-panel`
- `bg-surface-1`, `bg-surface-2`, `bg-accent`
- `text-muted`, `text-foreground`, `text-accent`
- `border-border`, `border-accent`

## Testing Recommendations

### Unit Tests
- Locked ingredient prevents substitution/deletion
- Proposed changes summary updates correctly
- Ingredient ID mapping works correctly

### Integration Tests
1. Propose changes → Regenerate → Verify candidate preview
2. Apply candidate → Verify editable recipe updated
3. Revert → Verify restoration to last saved state
4. Save → Verify persistence to database

### E2E Tests (Playwright)
```typescript
test('AI Edit workflow', async ({ page }) => {
  // Navigate to recipe
  await page.goto('/recipe/1');
  await page.click('text=AI Edit');
  
  // Propose substitution
  await page.selectOption('[id="ingredient-to-replace"]', 'ingredient-0');
  await page.fill('[id="replacement-text"]', 'chicken breast');
  await page.click('text=Add Substitution');
  
  // Regenerate
  await page.click('text=Regenerate Recipe');
  await page.waitForSelector('text=Regenerated Version');
  
  // Apply
  await page.click('text=Apply Regenerated Recipe');
  
  // Save
  await page.click('text=Save Changes');
  await page.waitForURL('/recipe/1');
});
```

## Navigation

Users can access AI Edit from:
- Recipe detail page → "AI Edit" button (next to "Edit recipe")
- Direct URL: `/recipe/[id]/ai-edit`

## Future Enhancements

Potential improvements (not implemented):
- Magnitude slider for macro adjustments
- Diff view showing original vs. regenerated side-by-side
- History of regenerations
- Save proposed changes as templates
- Batch operations on multiple ingredients
- Lock steps (currently only ingredients can be locked)
- Lock flavors/cuisine style

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── recipes/
│   │       └── [recipeId]/
│   │           └── ai-regenerate/
│   │               └── route.ts
│   └── recipe/
│       └── [recipeNumber]/
│           └── ai-edit/
│               └── page.tsx
└── components/
    └── recipe/
        └── ai-edit/
            ├── AIEditPanel.tsx
            ├── CandidatePreview.tsx
            ├── IngredientDeletion.tsx
            ├── IngredientSubstitution.tsx
            ├── MacroDirectionControl.tsx
            ├── ProposedChangesSummary.tsx
            └── QuickIntentsControl.tsx
```

## Definition of Done ✓

- [x] Users can propose substitution/deletion + macro direction + quick intents + notes
- [x] Regenerate produces a candidate preview without mutating the current form
- [x] Apply writes candidate into the form
- [x] Revert resets everything back to last saved state
- [x] No inline replaced-ingredient display inside the existing Ingredients list
- [x] Fully keyboard accessible, mobile-first, visually consistent with current page
- [x] Separate AI Edit page (not on top of existing edit form)
- [x] Ingredients and steps listed in AI edit page
- [x] Controls for edit/delete ingredient beside the recipe
- [x] Replacement intent and status shown in summary
- [x] No target macro inputs (only directional controls)
- [x] Lock ingredient functionality implemented
- [x] Professional, restrained design with no playful effects
