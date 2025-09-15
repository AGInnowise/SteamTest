const { BasePage } = require('../core/BasePage');

class AboutPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/about/';

    // Коллекция из всех элементов со статистикой
    this.onlineStats = this.page.locator('.online_stat');
  }

  _extractInt(text) {
    const digits = String(text).replace(/\D+/g, '');
    if (!digits) throw new Error(`Не удалось извлечь число из строки: "${text}"`);
    return parseInt(digits, 10);
  }

  /**
   * Возвращает текст первого элемента из коллекции `.online_stat`.
   */
  async getOnline() {
    const first = this.onlineStats.nth(0);
    await first.waitFor({ state: 'visible' });
    const raw = (await first.innerText()).trim();
    return this._extractInt(raw);
  }

  /**
   * Возвращает текст второго элемента из коллекции `.online_stat`.
   */
  async getPlayingNow() {
    const second = this.onlineStats.nth(1);
    await second.waitFor({ state: 'visible' });
    const raw = (await second.innerText()).trim();
    return this._extractInt(raw);
  }
}

module.exports = { AboutPage };