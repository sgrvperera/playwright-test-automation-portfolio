import { test as setup } from '@playwright/test';
import { LoginPage } from '../src/pages/login-page';
import { config } from '../src/config/environment';

const authFile = 'auth-state.json';

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  const credentials = config.getAdminCredentials();
  await loginPage.login(credentials.email, credentials.password);
  
  await page.waitForURL(/dashboard/);
  await page.context().storageState({ path: authFile });
});
