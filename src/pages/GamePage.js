// src/pages/GamePage.js
const { expect } = require('@playwright/test');

function normalizeText(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

class GamePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.appTitle = page.locator('.apphub_AppName'); // основной заголовок
    this.releaseDate = page.locator('.release_date .date');
    // цена: обычная или со скидкой
    this.finalPrice = page.locator('.game_purchase_price, .discount_final_price');
    this.purchaseBlock = page.locator('.game_area_purchase_game, .game_purchase_section');
  }

  async bypassAgeGate() {
    // If age gate appears, try the common bypass actions
    if (await this.page.locator('#age_gate_btn_continue, a[href*="agecheck"]:has-text("Continue")').first().isVisible().catch(() => false)) {
      await this.page.locator('#age_gate_btn_continue, a[href*="agecheck"]:has-text("Continue")').first().click();
      await this.page.waitForLoadState('networkidle');
    }
    // Some games show a simple link "View Page"
    if (await this.page.locator('a:has-text("View Page")').first().isVisible().catch(() => false)) {
      await this.page.locator('a:has-text("View Page")').first().click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async getGameDetails() {
    await this.bypassAgeGate();
    await this.page.waitForSelector('.apphub_AppName', { timeout: 20000 });
    await this.purchaseBlock.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

    const title = normalizeText(await this.appTitle.first().innerText());
    const releaseDate = (await this.releaseDate.count())
      ? normalizeText(await this.releaseDate.first().innerText())
      : '';

    let price = '';
    if (await this.finalPrice.count()) {
      price = normalizeText(await this.finalPrice.first().innerText());
    } else if (await this.page.locator('.game_area_purchase_game .game_purchase_price').count()) {
      price = normalizeText(await this.page.locator('.game_area_purchase_game .game_purchase_price').first().innerText());
    } else if (await this.page.locator('.game_area_purchase_game:has-text("Free To Play")').count()) {
      price = 'Free To Play';
    } else if (await this.page.locator('div.game_area_purchase_game:has-text("Free")').count()) {
      price = 'Free';
    } else {
      price = '';
    }

    return { title, releaseDate, price };
  }
}

module.exports = { GamePage };