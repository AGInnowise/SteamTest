const { expect } = require('@playwright/test');
const { BaseElement } = require('./BaseElement');
const { logger } = require('./logger');

class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.url = null; // задаём в наследниках
  }

  elBy(locator, name) {
    return new BaseElement(this.page, locator, name);
  }

  elByRole(role, options, name) {
    return new BaseElement(this.page, this.page.getByRole(role, options), name);
  }

  elBySelector(selector, name) {
    return new BaseElement(this.page, this.page.locator(selector), name);
  }

  async open(path = this.url) {
    logger.step(`OPEN: ${path}`);
    await this.page.goto(path, { waitUntil: 'load' });
  }

  async expectUrl(re) {
    await expect(this.page).toHaveURL(re);
  }

  // Общие элементы шапки Steam (STORE / COMMUNITY / ABOUT / SUPPORT)
get navStore() {
  return this.elBy(
    this.page.locator('a[data-tooltip-content=".submenu_Store"]').nth(1),
    'nav STORE'
  );
}  get navAbout() {
    const loc = this.page
      .locator('a[href*="global-header"]').filter({ hasText: /about/i });
    return this.elBy(loc, 'nav ABOUT');
  }

  async goToStore() { await this.navStore.click(); }
  async goToAbout() { await this.navAbout.click(); }
}

module.exports = { BasePage };