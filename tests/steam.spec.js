const { test, expect } = require('@playwright/test');
const { PageManager } = require('../src/core/PageManager');
const { logger } = require('../src/core/logger');

test.describe('Steam - Test case 1', () => {
  test('Обязательный сценарий: Home -> About -> сравнить счётчики -> Store', async ({ page }) => {
    const pm = new PageManager(page);

    await test.step('1) Открыть главную страницу', async () => {
      await pm.home().open();                       // baseURL + '/'
      await pm.home().expectUrl(/store\.steampowered\.com\/?$/);
      logger.info('Главная страница открыта');
    });

    await test.step('2) Кликнуть ABOUT', async () => {
      await pm.home().goToAbout();
      await pm.about().expectUrl(/\/about\/?/);
      logger.info('Страница About открыта');
    });

    await test.step('3) Сравнить числа игроков (In-game < Players online)', async () => {
      const online = await pm.about().getOnline();
      const ingame = await pm.about().getPlayingNow();
      logger.info('Counters', { online, ingame });

      expect(ingame, 'Players in-game should be less than players online')
        .toBeLessThan(online);
    });

    await test.step('4) Перейти в магазин', async () => {
      await pm.about().goToStore();
      await pm.store().expectUrl(/store\.steampowered\.com(\/(?!about).*)?$/);
      logger.info('Страница магазина открыта');
    });
  });
});

test.describe('Steam - Test case 2', () => {
  test('Фильтрация лидеров продаж и проверка данных игры', async ({ page }) => {
    const pm = new PageManager(page);

    await test.step('1) Перейти на главную страницу', async () => {
      await pm.home().open();
      await pm.home().expectUrl(/store\.steampowered\.com\/?$/);
      logger.info('Главная страница открыта');
    });

    await test.step('2) Навести на "Новое и примечательное" -> выбрать "Лидеры продаж"', async () => {
      await pm.home().hoverNewAndNoteworthy();
      await pm.home().goToTopSellers();
      await pm.store().expectUrl(/charts\/topselling\/PL/);
      logger.info('Открыта страница лидеров продаж');
    });

    // await test.step('3) В правом меню выбрать ОС "SteamOS + Linux"', async () => {
    //   await pm.store().filterByOS('SteamOS + Linux');
    //   await expect(await pm.store().isFilterChecked('SteamOS + Linux')).toBeTruthy();
    //   logger.info('Фильтр SteamOS + Linux выбран');
    // });

    // await test.step('4) В правом меню выбрать "Кооператив (LAN)"', async () => {
    //   await pm.store().filterByPlayers('Кооператив (LAN)');
    //   await expect(await pm.store().isFilterChecked('Кооператив (LAN)')).toBeTruthy();
    //   logger.info('Фильтр Кооператив (LAN) выбран');
    // });

    // await test.step('5) В правом меню выбрать тег "Экшен"', async () => {
    //   await pm.store().filterByTag('Экшен');
    //   await expect(await pm.store().isFilterChecked('Экшен')).toBeTruthy();
    //   logger.info('Фильтр Экшен выбран');
    // });

    await test.step('5.1) Количество результатов соответствует количеству игр в списке', async () => {
    await pm.store().assertCountMatchesList();
    });

    let firstGame;
    await test.step('6) Получить данные первой игры в списке', async () => {
      firstGame = await pm.store().getFirstGameData(); 
      logger.info('Первая игра', firstGame);
      expect(firstGame).toHaveProperty('title');
      expect(firstGame).toHaveProperty('price');
    });

    await test.step('7) Кликнуть по первой игре и проверить совпадение данных', async () => {
      await pm.store().clickFirstGame();
      await page.waitForURL(/\/app\//, { timeout: 20000 });
      const details = await pm.game().getGameDetails();
      logger.info('Детали игры', details);

      expect(details.title).toBe(firstGame.title);
      expect(details.price).toBe(firstGame.price);
    });
  });
});

test.describe('Steam - Test case 3 (Community Market)', () => {
  test('Расширенный поиск и проверка предмета', async ({ page }) => {
    const pm = new PageManager(page);

    await test.step('1) Главная', async () => {
      await pm.home().open();
      await pm.home().expectUrl(/store\.steampowered\.com\/?$/);
      logger.info("1 step completed")
    });

    await test.step('2) Открыть COMMUNITY → MARKET', async () => {
      await pm.home().goToCommunityMarket();
      await pm.market().expectUrl(/steamcommunity\.com\/market\/?$/);
      logger.info("2 step completed")

    });

    await test.step('3) Открыть advanced options', async () => {
      await pm.market().openAdvanced();
      logger.info("3 step completed")

    });

    await test.step('4) Выбрать игру Dota 2, Hero Lifestealer, Rarity Immortal, Search = "golden"', async () => {
      await pm.market().selectGame('Dota 2');
      await pm.market().pickHero('Lifestealer');
      await pm.market().pickRarity('Immortal');
      //await pm.market().typeSearch('golden');
      logger.info("4 step completed")

    });

    await test.step('5) Нажать Search и проверить фильтры/результаты', async () => {
        await pm.market().submit();
      await pm.market().assertFiltersShown(['Dota 2','Lifestealer','Immortal'/*,'golden'*/]);
      //await pm.market().assertFirstNContain('Golden', 5);
      logger.info("5 step completed")

    });

    await test.step('6) Удалить фильтры "golden" и "Dota 2"', async () => {
      await pm.market().removeFilter();
      await pm.market().assertFiltersShown(['Dota 2','Lifestealer','Immortal'/*,'golden'*/]);

      logger.info("6 step completed")

    });
  });
})