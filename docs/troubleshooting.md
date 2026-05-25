# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

**Problem**: Playwright browsers not installed
```bash
npx playwright install
```

**Problem**: Dependencies missing
```bash
npm ci
```

### Test Execution Issues

**Problem**: Tests fail with "Target closed" error
- Solution: Increase timeout in playwright.config.ts
- Check if demo app is running

**Problem**: Authentication tests fail
- Solution: Verify .env credentials match demo-app/server.js
- Check if auth-state.json is generated

**Problem**: API tests fail with 401
- Solution: Ensure authentication is working
- Check token is being set correctly

### Demo App Issues

**Problem**: Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in .env and playwright.config.ts
```

**Problem**: Demo app not starting
- Check Node.js version (18+)
- Verify all dependencies installed
- Check console for errors

### CI/CD Issues

**Problem**: Tests pass locally but fail in CI
- Check environment variables
- Verify browser installation
- Review CI logs for specific errors

**Problem**: Artifacts not uploading
- Check GitHub Actions permissions
- Verify artifact paths exist

## Best Practices

1. Always run `npm run type-check` before committing
2. Use `npm run lint:fix` to auto-fix linting issues
3. Run smoke tests before pushing: `npm run test:smoke`
4. Check logs in `test-execution.log` for debugging
5. Use `--debug` flag for step-by-step execution

## Getting Help

- Check test-execution.log for detailed logs
- Review Playwright traces in HTML report
- Use `npx playwright show-trace trace.zip` for trace analysis
