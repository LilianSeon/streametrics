import { isURLTwitch, getNbViewer, waitForElm, getDuration, formatChartTitle, getGameName, backGroundThemeObserver, ThemeBackgroundColor } from './utils/utils.js';
import { ChartData, ChartExtension } from './js/chartExtension.js';

let interval: NodeJS.Timeout;
let chartExtension: ChartExtension;
let data: ChartData[] = [];

/**
 * Get needed data then add it to the Chart
 */
const startLoopGetData = () => {
    if (typeof interval === 'undefined') {
        interval = setInterval(() => {
            const duration = getDuration(document);
            const nbViewer = getNbViewer(document);
            const game = getGameName(document);

            if (chartExtension && duration && nbViewer) {

                //const peaks: Peak[] = computedDataLabel(data, nbViewer) || []; // return dataLabel if needed;

                const newData = {
                    id: duration,
                    duration,
                    nbViewer,
                    game,
                    time: new Date(),
                } as ChartData;

                chartExtension.addData({ ...newData });
                //chartExtension.addPeaks(peaks);
                data.push(newData);

            }
        }, 5000);
    }
};

/**
 * Check if `#live-channel-stream-information` is in DOM or wait for it, then start getting datas and init chart
 */
const initChartInDOM = () => {
    waitForElm('#live-channel-stream-information').then((element: Element | null) => {
        startLoopGetData();
        if (element) {
            const chartTitle: string = formatChartTitle(window.location.pathname);
            const textColor: string = document.documentElement.className.includes('dark') ? '#ffffff' : '#000000';
            chartExtension = new ChartExtension(element, chartTitle, textColor);
            backGroundThemeObserver(document, updateDefaultColor);
        }
        
    });
};

chrome.runtime.onMessage.addListener((request, _sender) => { // When user goes from a Twitch URL to another Twitch URL
    console.log("Message received in contentScript:", request);

    if (isURLTwitch(request.url)) {

        if (formatChartTitle(window.location.pathname).includes(chartExtension.chartTitle.replace("'s viewers", ""))) return; // if page reloaded but still on same page, do not init another Chart

        if (chartExtension instanceof ChartExtension) { // If Chart already exists in DOM
            chartExtension.destroy();
            initChartInDOM();
        } else {
            initChartInDOM();
        }
    }
});

const updateDefaultColor = (theme: ThemeBackgroundColor): void => {
    if (chartExtension instanceof ChartExtension) {
        const newColor = (theme === 'dark') ? '#ffffff' : '#000000';
        chartExtension.setDefaultColor(newColor);
    }
};


window.addEventListener('DOMContentLoaded', () => {
    initChartInDOM();
});
