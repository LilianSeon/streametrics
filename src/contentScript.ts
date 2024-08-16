import { isURLTwitch, getNbViewer, waitForElm, getDuration, formatChartTitle, getGameName, computedDataLabel } from './utils/utils.js';
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

                const { dataLabel, dataLabelColor } = computedDataLabel(data, nbViewer) || {}; // return dataLabel if needed;

                const newData = {
                    duration,
                    nbViewer,
                    game,
                    time: new Date(),
                    dataLabel,
                    dataLabelColor
                } as ChartData;

                chartExtension.addData({ ...newData });
                data.push(newData);

            }
        }, 1000);
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
            chartExtension = new ChartExtension(element, chartTitle);
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


window.addEventListener('DOMContentLoaded', () => {
    
    initChartInDOM();

});
