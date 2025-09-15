// src/core/PageManager.js
const { HomePage } = require('../pages/HomePage');
const { AboutPage } = require('../pages/AboutPage');
const { StorePage } = require('../pages/StorePage');
const { GamePage } = require('../pages/GamePage');
const { MarketPage } = require('../pages/MarketPage'); // + импорт

class PageManager {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this._home = null;
    this._about = null;
    this._store = null;
    this._game = null;
    this._market = null;
  }

  home() {
    if (!this._home) this._home = new HomePage(this.page);
    return this._home;
  }
  about() {
    if (!this._about) this._about = new AboutPage(this.page);
    return this._about;
  }
  store() {
    if (!this._store) this._store = new StorePage(this.page);
    return this._store;
  }
  game() {
    if (!this._game) this._game = new GamePage(this.page);
    return this._game;
  }
  market(){
    if(!this._market) this._market = new MarketPage(this.page);
    return this._market;
  }
}

module.exports = { PageManager };