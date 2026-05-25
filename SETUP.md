# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Install Playwright Browsers

```bash
npx playwright install
```

## Step 3: Verify Setup

```bash
# Check TypeScript compilation
npm run type-check

# Check code quality
npm run lint
```

## Step 4: Start Demo Application

Open a new terminal and run:

```bash
npm run demo:start
```

The app will be available at http://localhost:3000

Demo credentials:
- Admin: admin@projecthub.com / Admin@123
- User: user@projecthub.com / User@123

## Step 5: Run Tests

In another terminal:

```bash
# Run smoke tests (fastest)
npm run test:smoke

# Run all tests
npm test

# Run with UI mode (recommended for first time)
npm run test:ui-mode
```

## Step 6: View Reports

```bash
npm run report
```

## Troubleshooting

If tests fail:
1. Ensure demo app is running on port 3000
2. Check .env file exists with correct values
3. Verify Playwright browsers are installed
4. Check test-execution.log for details

## Next Steps

1. Explore the test files in `tests/ui/` and `tests/api/`
2. Review page objects in `src/pages/`
3. Check the architecture documentation in `docs/`
4. Customize for your needs

## CI/CD Setup

Push to GitHub and the workflow will automatically run:
- Code quality checks
- UI tests across browsers
- API tests
- Smoke tests

Reports will be available as artifacts.

---

**You're ready to demonstrate enterprise-grade automation!**
