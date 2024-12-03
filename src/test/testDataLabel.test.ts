/// <reference types="chrome"/>

import { describe, test, beforeEach } from "vitest";
import { Browser, connect, ExtensionTransport} from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

// Utils
//import { detectPeaks, findPeaks } from '../utils/utils';

// Types
//import { ChartExtensionData } from '../js/chartExtension';

// Data mockup
import { data1 } from './mockup/data1';
import { ChartDataViewer } from "../js/chartExtension";
import ChartExtension from "../js/chartExtension";

let chartExtension: ChartExtension;
let browser: Browser;

describe('Utils functions', () => {

    beforeEach(async () => {
        /*const container = document.createElement('div');
        container.setAttribute("id", "chartContainer")
        console.log(document.getElementById('vitest-ui'))
        //@ts-ignore
        document.getElementById('vitest-ui')!.document.appendChild(container);
        chartExtension = new ChartExtension(document.getElementsByTagName('body')[0], 'myTitle', '#000000');
        console.log(document.getElementById('vitest-ui'))*/
        // Create a tab or find a tab to attach to.
        const tab = await chrome.tabs.create({
            url: 'https://www.twitch.tv/tikyjr',
        });
        // Connect Puppeteer using the ExtensionTransport.connectTab.
        if (tab?.id) {
            browser = await connect({
                transport: await ExtensionTransport.connectTab(tab.id),
            });
        }
        
        // You will have a single page on the browser object, which corresponds
        // to the tab you connected the transport to.
        const [page] = await browser.pages();
        // Perform the usual operations with Puppeteer page.
        console.log(await page.evaluate('document.title'));
    });

    test('detectPeaks', () => {
        if (chartExtension) {
            data1.forEach((data: ChartDataViewer) => {
                chartExtension.addData(data, 15);
                console.log(data)
            });
        }
        /*console.log(detectPeaks(data1));
        console.log(findPeaks(data1, 2));*/

    });
});