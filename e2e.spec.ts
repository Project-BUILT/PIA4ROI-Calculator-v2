import { test, expect } from '@playwright/test';

test('Smoke Test: Happy Path', async ({ page }) => {
  // 1. Load Landing
  await page.goto('/');
  await expect(page.getByText('Burnout costs your department')).toBeVisible();
  
  // 2. Click Start
  await page.click('text=Show me the 60-second savings');
  await expect(page).toHaveURL(/.*quick/);

  // 3. Fill Form
  await page.fill('input[type="number"]', '100'); // Headcount
  
  // 4. Submit
  await page.click('text=See the fiscal impact');
  await expect(page).toHaveURL(/.*results/);

  // 5. Unlock (Email Gate)
  await page.fill('input[type="email"]', 'chief@test.gov');
  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Unlock Results")');

  // 6. Verify Results visible
  await expect(page.getByText('Estimated Annual Avoidable Loss')).toBeVisible();
});
