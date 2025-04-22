import path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { beforeEach, afterEach, test, expect } from 'vitest'

const EXTENSION_PATH = path.join(process.cwd(), 'dist');
const EXTENSION_ID = 'oebogjkjhmaifchplglelphhlefhiico';

let browser: Browser | undefined;


beforeEach(async () => {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
        headless: false,
        args: [
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`,
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
    });
}, 30000);

afterEach(async () => {
    await browser?.close();
    browser = undefined;
});

test('popup renders correctly', async () => {
    const pageExtension = await browser?.newPage();
    await pageExtension?.goto(`chrome-extension://${EXTENSION_ID}/index.html`);
    const table = await pageExtension?.$('table');

    const pageTwitch = await browser?.newPage();
    await pageTwitch?.goto(`https://www.twitch.tv/`);

    await pageTwitch?.click('[data-a-target*="tw-core-button-label-text"]'); // Accepte cookies

    const wait = (time: number) => {
        return new Promise(function(resolve) { 
            setTimeout(resolve, time)
        });
    };
    
    await wait(6000);

    await pageTwitch?.click('[data-a-target*="player-overlay-click-handler"]');


    expect(table).toBeDefined();
}, 40000);