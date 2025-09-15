// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'https://store.steampowered.com',
    headless: true,
    viewport: { width: 1366, height: 768 },
    locale: 'en-US',
    // Стабилизируем текстовые локаторы (ABOUT/STORE):
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});