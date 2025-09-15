const fs = require('fs');
const path = require('path');

function createFile(filePath, content = '') {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created: ${filePath}`);
  } else {
    console.log(`Skipped (exists): ${filePath}`);
  }
}

function main() {
  // src/core
  createFile('src/core/logger.js');
  createFile('src/core/BaseElement.js');
  createFile('src/core/BasePage.js');
  createFile('src/core/PageManager.js');

  // src/pages
  createFile('src/pages/HomePage.js');
  createFile('src/pages/AboutPage.js');
  createFile('src/pages/StorePage.js');

  // tests
  createFile('tests/steam.spec.js');

  // playwright.config.js
  createFile('playwright.config.js');

  console.log('\n✅ Project structure ready!');
}

main();