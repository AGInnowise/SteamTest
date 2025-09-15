const { BasePage } = require('../core/BasePage');

// src/pages/HomePage.js
class HomePage{
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.url = '/';
    // главный таб "Новое и примечательное"
    this.newAndNoteworthyTab = page.locator('#noteworthy_tab');
    // пункт "Лидеры продаж" в выпадающем меню
    this.topSellersLink = page.locator('a.popup_menu_item[href*="charts/topselling"]');  }

  async open() {
    await this.page.goto(this.url);
  }

  async expectUrl(re) {
    await this.page.waitForURL(re, { timeout: 15000 });
  }

  async goToAbout() {
    await this.page.locator('a[href*="global-header"]').filter({ hasText: /about/i }).click();
  }

  // === добавлено для Test case 2 ===
  async hoverNewAndNoteworthy() {
    await this.newAndNoteworthyTab.hover();
    // ждём появления дропдауна
    await this.page.locator('#noteworthy_flyout, #noteworthy_popup').waitFor({ state: 'visible' });
  }

  async goToTopSellers() {
    // на некоторых локалях ссылка рендерится чуть позже
    await this.topSellersLink.waitFor({ state: 'visible' });
    await this.topSellersLink.click();
  }

// Ховер по COMMUNITY и клик по MARKET (устойчиво под текущий DOM)
async goToCommunityMarket() {
  // пункт COMMUNITY в шапке (имеет data-tooltip-content=".submenu_Community")
  const communityTrigger = this.page.locator(
    '#global_header a.supernav[data-tooltip-content=".submenu_Community"], ' +
    '#global_header a.supernav:has-text("COMMUNITY")'
  );

  await communityTrigger.first().hover();

  // всплывающий контейнер меню (tooltip) с нужным подменю
  const communityMenu = this.page.locator('.supernav_content .submenu_Community');
  await communityMenu.waitFor({ state: 'visible', timeout: 15000 });

  // ссылка Market внутри этого подменю
  const marketLink = communityMenu.locator('a.submenuitem[href*="steamcommunity.com/market"], a.submenuitem:has-text("Market")');
  await marketLink.first().click();
}
}

module.exports = { HomePage };