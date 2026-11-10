import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screensDir = path.resolve(__dirname, '../../docs/screens');

test.beforeAll(() => {
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }
});

test.describe('Accessibility & UI Quality Standards', () => {
  test('passes axe-core accessibility audit on landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Color contrast is exhaustively verified by scan_contrast.mjs (WCAG AA 4.5:1)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('verifies base typography meets >= 18px body font standard', async ({ page }) => {
    await page.goto('/');
    const bodyFontSize = await page.evaluate(() => {
      return parseFloat(window.getComputedStyle(document.body).fontSize);
    });
    expect(bodyFontSize).toBeGreaterThanOrEqual(18);
  });

  test('verifies zero horizontal overflow at 360px mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('verifies interactive button heights meet >= 48px touch target standard', async ({ page }) => {
    await page.goto('/#/roadmaps/new');
    const submitBtnHeight = await page.locator('button[type="submit"]').evaluate(el => el.offsetHeight);
    expect(submitBtnHeight).toBeGreaterThanOrEqual(48);
  });

  test('verifies light and dark theme toggle functionality', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    // Toggle button in header
    const toggleBtn = page.locator('header button[aria-label*="Switch to"]');
    await expect(toggleBtn).toBeVisible();

    const isInitiallyDark = await html.evaluate(el => el.classList.contains('dark'));

    await toggleBtn.click();
    const isDarkAfterToggle = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDarkAfterToggle).toBe(!isInitiallyDark);

    await toggleBtn.click();
    const isDarkReverted = await html.evaluate(el => el.classList.contains('dark'));
    expect(isDarkReverted).toBe(isInitiallyDark);
  });
});

test.describe('Navigation & Screenshots Capture Suite', () => {
  test('captures desktop screens in light and dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // 1. Landing Page Light
    await page.goto('/');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screensDir, 'desktop_light_landing.png'), fullPage: false });

    // 2. Landing Page Dark
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({ path: path.join(screensDir, 'desktop_dark_landing.png'), fullPage: false });

    // 3. Roadmap Detail Light
    await page.goto('/#/roadmaps/1');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screensDir, 'desktop_light_roadmap_detail.png'), fullPage: false });

    // 4. Roadmap Detail Dark
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({ path: path.join(screensDir, 'desktop_dark_roadmap_detail.png'), fullPage: false });

    // 5. Grant Detail Light
    await page.goto('/#/grants/1');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screensDir, 'desktop_light_grant_detail.png'), fullPage: false });

    // 6. Grant Detail Dark
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({ path: path.join(screensDir, 'desktop_dark_grant_detail.png'), fullPage: false });

    // 7. Evidence Audit Page Light
    await page.goto('/#/evidence');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screensDir, 'desktop_light_evidence.png'), fullPage: false });

    // 8. Contract Limits Page Light
    await page.goto('/#/limits');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screensDir, 'desktop_light_limits.png'), fullPage: false });
  });

  test('captures mobile 360px screens in light and dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });

    // Mobile Landing Light
    await page.goto('/');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screensDir, 'mobile_light_landing.png'), fullPage: false });

    // Mobile Landing Dark
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({ path: path.join(screensDir, 'mobile_dark_landing.png'), fullPage: false });
  });
});
