const { expect } = require('@playwright/test');
const { logger } = require('./logger');

class BaseElement {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').Locator} locator
   * @param {string} [name]
   */
  constructor(page, target, name = '') {
    this.page = page;
    this.name = name;
    this.locator = typeof target === 'string' ? page.locator(target) : target;
  }

  async click() {
    logger.info(`Click: ${this.name}`);
    await this.locator.click();
  }

  async text() {
    const t = await this.locator.innerText();
    logger.info(`Text(${this.name}): ${t}`);
    return t;
  }

  async shouldBeVisible() {
    await expect(this.locator, `${this.name} should be visible`).toBeVisible();
  }
}

module.exports = { BaseElement };