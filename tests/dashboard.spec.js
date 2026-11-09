import { test, expect } from '@playwright/test'
test.beforeEach(async ({ page }) => { await page.goto('./'); await page.evaluate(() => document.fonts.ready) })

test('the catch panel names a pair and a note', async ({ page }) => {
  await expect(page.getByTestId('catch')).toBeVisible()
  await expect(page.getByTestId('catch-note')).not.toBeEmpty()
})

test('the header reports the rubric is sound', async ({ page }) => {
  await expect(page.locator('.stats')).toContainText('sound')
  await expect(page.locator('.stats')).toContainText('yes')
})

test('the matrix has two rows per pair', async ({ page }) => {
  const rows = page.locator('[data-testid="matrix"] tbody tr')
  await expect(rows).toHaveCount(8)
})

test('dashboard screenshot is stable', async ({ page }) => {
  await expect(page.locator('main')).toHaveScreenshot('dashboard.png')
})
