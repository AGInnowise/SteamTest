// src/pages/MarketPage.js
const { expect } = require('@playwright/test');

function n(s){ return (s||'').replace(/\s+/g,' ').trim(); }

class MarketPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page){
    this.page = page;
    // результаты
    this.resultRows = page.locator('a.market_listing_row_link');
    this.resultItemName = (i)=> this.resultRows.nth(i).locator('.market_listing_item_name');
    // панель активных фильтров/крошек
    this.activeFiltersBar = page.locator('#searchResultsTable .market_search_results_header, #searchResultsTable .market-search-bar');
    this.advancedLink = page.locator('#market_search_advanced_show, .market_search_advanced_button, span:has-text("Show advanced options")');
    this.gameDropdown = page.locator('#appSelect, select[name="appid"]');
    this.activeGameButton = page.locator('#market_advancedsearch_appselect_activeapp');
    this.heroSelect = page.locator('select[name^="category_"][name*="Hero"]');
    this.heroDropdown = page.locator('select[name="category_570_Hero[]"]');
    this.raritySelect = page.locator('select[name^="category_"][name*="Rarity"]');
    this.searchInput  = page.locator('#advancedSearchBox');
    this.searchBtn    = page.locator('//*[@id="market_advancedsearch_dialog"]/div[2]/div[2]');
    this.cookiesReject = page.locator('#acceptAllButton');
    this.resultsContainer = page.locator('a.market_listing_row_link');
  }

  async expectUrl(re){ await this.page.waitForURL(re, { timeout: 20000 }); }

  // открыть расширенные параметры
  async openAdvanced(){
    if (await this.advancedLink.first().isVisible()) {
      await this.advancedLink.first().click();
    }
    // ждём появления блоков расширенного поиска (несколько вариантов разметки)
    await this.page
      .locator('#market_advanced_search, #market_advancedsearch, #market_search_advanced, #advancedSearchOptions, #market_advancedsearch_appselect, .market_advancedsearch_appselect')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(()=>{});
  }

  async selectGame(gameName) { // 'Dota 2'
    if (await this.gameDropdown.count()) {
      await this.gameDropdown.selectOption({ label: gameName }).catch(async () => {
        await this.page.locator('.market_advancedsearch_appname:has-text("' + gameName + '")').click().catch(() => {});
      });
    } else if (await this.activeGameButton.isVisible()) {
      await this.activeGameButton.click();
      await this.page.locator('#app_option_570').click();
    } else {
      await this.page.locator('#sideBar a, #findItems .game_button, #findItems a').filter({ hasText: gameName }).first().click();
    }
  }

  async pickHero(heroName) {
  if (await this.heroDropdown.count()) {
    await this.heroDropdown.click();
    await this.heroDropdown.selectOption('tag_npc_dota_hero_life_stealer');
    // ждём, пока в value появится выбранный тег
    await expect(this.heroDropdown).toHaveValue(/life_stealer/, { timeout: 5000 });
  } else if (await this.heroSelect.count()) {
    await this.heroSelect.selectOption({ label: heroName });
    await expect(this.heroSelect).toHaveValue(/life_stealer/, { timeout: 5000 });
  } else {
    const lab = this.page.locator('label:has-text("' + heroName + '")');
    //await lab.scrollIntoViewIfNeeded();
    await lab.click();
  }
}

async pickRarity(rarity) {
  if (await this.raritySelect.count()) {
    await this.raritySelect.selectOption({ label: rarity });
    await expect(this.raritySelect).toHaveValue(/Immortal/i, { timeout: 5000 });
  } else {
    const lab = this.page.locator('label:has-text("' + rarity + '")');
    await lab.scrollIntoViewIfNeeded();
    await lab.click();
  }
}

async submit() {
  // Закрываем cookie-баннер, если перекрывает низ экрана
  await this.cookiesReject.first().click({ timeout: 1000 }).catch(() => {});

  const btn = this.searchBtn.first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();

  // ждём, пока появится таблица с результатами
  await this.resultsContainer.first().waitFor({ state: 'visible', timeout: 20000 });
  await this.resultRows.first().waitFor({ state: 'visible', timeout: 20000 });
}

async typeSearch(text){       // 'golden'
    await this.searchInput.fill(text);
  }

  async assertFiltersShown(parts){ // ['Dota 2','Lifestealer','Immortal','golden']
  const terms = this.page.locator('.market_searchedForTerm');

  // дождёмся появления хотя бы одного терма
  await terms.first().waitFor({ state: 'visible', timeout: 10000 });

  // возьмём тексты всех совпадений и склеим
  const texts = await terms.allInnerTexts();         // => string[]
  const haystack = texts.map(n).join(' ').toLowerCase();

  for (const p of parts) {
    expect(haystack).toContain(p.toLowerCase());
  }
}

  async assertFirstNContain(substr, nItems = 5){
    const nRows = Math.min(await this.resultRows.count(), nItems);
    expect(nRows).toBeGreaterThan(0);
    for (let i=0;i<nRows;i++){
      const name = n(await this.resultItemName(i).innerText());
      expect(name.toLowerCase()).toContain(substr.toLowerCase());
    }
  }

  async removeFilter(){ // удаляет «чип» фильтра по тексту
    const clearFilter = this.page.locator('.market_searchedForTerm:has-text("Dota 2") .removeIcon')
      await clearFilter.click();
  }

  async getFirstItemName(){
    await this.resultRows.first().waitFor({ state:'visible', timeout:20000 });
    return n(await this.resultItemName(0).innerText());
  }

  async clickFirstItem(){
    await this.resultRows.first().click();
  }
}

module.exports = { MarketPage };