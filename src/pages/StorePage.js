// src/pages/StorePage.js
const { expect } = require('@playwright/test');
const { logger } = require('../core/logger');

function normalizeText(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

class StorePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // список карточек результатов
    this.resultRows = page.locator('._2-RN6nWOY56sNmcDHu069P');
    // необязательный виджет с количеством результатов (если есть)
    this.resultsCountLabel = page.locator('#search_results .search_results_count, #search_results .search_pagination_left');
  }

  async expectUrl(re) {
    await this.page.waitForURL(re, { timeout: 15000 });
  }

  // ---------- Фильтры справа ----------
  /**
   * Кликает чекбокс фильтра по видимому тексту лейбла.
   * Работает для блоков "Операционная система", "Количество игроков", "Метки".
   */
  async checkFilterByLabel(labelText) {
    const label = this.page.locator(
      '#search_filter_controls, #additional_search_filters, #search_filters_rightcol'
    ).locator(`label:has-text("${labelText}")`);
    await label.scrollIntoViewIfNeeded();
    await label.click(); // клик по label переключает input[type=checkbox]
    // небольшое ожидание обновления результатов
    await this.page.waitForLoadState('networkidle');
  }

  async filterByOS(osText /* e.g. "SteamOS + Linux" */) {
    await this.checkFilterByLabel(osText);
  }

  async filterByPlayers(playersText /* e.g. "Кооператив (LAN)" */) {
    await this.checkFilterByLabel(playersText);
  }

  async filterByTag(tagText /* e.g. "Экшен" */) {
    await this.checkFilterByLabel(tagText);
  }

  async isFilterChecked(labelText) {
    const label = this.page.locator(
      '#search_filter_controls, #additional_search_filters, #search_filters_rightcol'
    ).locator(`label:has-text("${labelText}")`);
    const checkbox = label.locator('input[type="checkbox"]');
    // если инпут визуально скрыт, но остаётся в DOM
    if (await checkbox.count()) {
      return await checkbox.first().isChecked();
    }
    // fallback: у label появляется класс checked
    const cls = await label.first().getAttribute('class');
    return (cls || '').includes('checked');
  }

  // ---------- Результаты ----------
  async getVisibleResultsCount() {
    await this.page.waitForSelector('._2-RN6nWOY56sNmcDHu069P', { state: 'visible', timeout: 15000 });
    return await this.resultRows.count();
  }

  /**
   * Пробуем достать число из лейбла "Результаты" (на всех локалях может отличаться).
   * Если не получилось — возвращаем кол-во видимых карточек.
   */
  async getHeaderResultsCountOrFallback() {
    if (await this.resultsCountLabel.isVisible()) {
      const t = await this.resultsCountLabel.innerText();
      const num = (t.match(/\d[\d\s.,]*/g) || [])
        .map(s => Number(s.replace(/[^\d]/g, '')))
        .pop();
      if (num) return num;
    }
    return this.getVisibleResultsCount();
  }

  async assertCountMatchesList() {
    const header = await this.getHeaderResultsCountOrFallback();
    const list = await this.getVisibleResultsCount();
    logger.info("Header " + header);
    logger.info("List " + list)
    expect(list).toBeGreaterThan(0);
    expect(list).toBe(header);
  }

  // ---------- Данные первой игры ----------
  async getFirstGameData() {
    const first = this.resultRows.first();
    await expect(first).toBeVisible();

    const title = normalizeText(await first.locator('._1n_4-zvf0n4aqGEksbgW9N').innerText());
    //const releaseDate = normalizeText(await first.locator('.search_released').innerText());
    // цена может быть в .discount_final_price или в .search_price
    let price = '';
    if (await first.locator('._3j4dI1yA7cRfCvK8h406OB').count()) {
      price = normalizeText(await first.locator('._3j4dI1yA7cRfCvK8h406OB').innerText());
    } 
    // else {
    //   price = normalizeText(await first.locator('.search_price').innerText());
    // }
    logger.info("Price: " + price);
    logger.info("Title: " + title);
    return { title, /*releaseDate,*/ price };
  }

  async clickFirstGame() {
    await this.resultRows.first().click();
  }
}

module.exports = { StorePage };