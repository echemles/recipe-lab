# Testing Guide

## Environment Setup

### Required Environment Variables
```bash
# MongoDB connection for development
MONGODB_URI=mongodb://localhost:27017

# Database name (defaults to recipe_lab)
MONGODB_DB=recipe_lab

# Test database (separate from dev/prod)
MONGODB_URI_TEST=mongodb://localhost:27017
MONGODB_DB_TEST=recipe_lab_test

# OpenAI API key (for AI recipe generation)
OPENAI_API_KEY=your_openai_key_here
```

## Test Database Strategy

The application uses a dedicated test database to ensure isolation between development and testing:

- **Development Database**: `recipe_lab` (via `MONGODB_URI` and `MONGODB_DB`)
- **Test Database**: `recipe_lab_test` (via `MONGODB_URI_TEST` and `MONGODB_DB_TEST`)

### Database Connection Logic
```typescript
const isTestEnvironment =
  process.env.NODE_ENV === "test" || process.env.PLAYWRIGHT_TEST === "true";

const uri = isTestEnvironment
  ? process.env.MONGODB_URI_TEST ?? process.env.MONGODB_URI
  : process.env.MONGODB_URI;

const dbName = isTestEnvironment
  ? process.env.MONGODB_DB_TEST ?? `${process.env.MONGODB_DB ?? "recipe_lab"}_test`
  : process.env.MONGODB_DB ?? "recipe_lab";
```

## Running Tests

### Prerequisites
1. MongoDB must be running locally or accessible via connection string
2. Environment variables configured (see above)
3. Playwright browsers installed: `npx playwright install`

### Test Commands

The Playwright config now launches Next.js automatically on an isolated port (`3100` by default) with `NODE_ENV=test` and `PLAYWRIGHT_TEST=true`, so the UI always talks to the seeded test database.

```bash
# Install Playwright browsers
npm run playwright install

# Run all tests
npm test

# Run only CRUD E2E tests (boots dev server via Playwright webServer)
npm run test:e2e

# Run only smoke tests
npm run test:smoke

# Manual database reset and seeding
npm run test:db-setup
```

## Test Data Seeding

The test database is reset and seeded in two layers:

1. **Playwright global setup** drops and seeds once before the suite runs.
2. **Each CRUD test** calls `resetTestDatabase()` in `beforeEach` to guarantee a clean slate per test.

### Seed Data
- **Test Recipe Alpha**: Baking recipe with flour, sugar, baking powder
- **Test Recipe Beta**: Dinner recipe with ground beef, onion, tomato sauce

### Manual Seeding
```bash
# Reset and seed test database manually
NODE_ENV=test MONGODB_DB_TEST=recipe_lab_test npm run test:db-setup
```

## Test Isolation

- **Serial Execution**: CRUD tests run serially (`workers: 1`) to prevent database conflicts.
- **Database Reset**: Playwright global setup + per-test reset keep data deterministic.
- **Deterministic Data**: Same seed data for every test run

## CI Notes

For CI environments:
1. Set `MONGODB_URI_TEST` to CI MongoDB instance
2. Tests run with retries (`retries: 2`) for flaky network conditions
3. HTML reports generated for test results
4. Single worker execution ensures database consistency

## Test Selectors

Minimal set of stable `data-testid` attributes:

- `app-shell` - Main application wrapper
- `theme-toggle` - Theme switcher button
- `recipes-list` - Recipe list container
- `create-recipe-button` - Add recipe button
- `recipe-form` - Recipe create/edit form
- `title-input` - Recipe title field
- `save-button` - Save recipe button
- `delete-button` - Delete recipe button

## Debugging

```bash
# Run tests with UI for debugging
npx playwright test --ui

# Run specific test with debugging (new path)
npx playwright test tests/e2e/recipes/crud.spec.ts --debug

# Show HTML report
npx playwright show-report
```
