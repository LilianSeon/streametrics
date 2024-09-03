import { isURLTwitch, getNbViewer, waitForElm, getDuration, formatChartTitle, getGameName, backGroundThemeObserver, ThemeBackgroundColor } from './utils/utils';
import { getStorage, setStorage } from './utils/utilsStorage'
import { ChartDataViewer, ChartExtension } from './js/chartExtension';

// Template
import Accordion from './templates/accordion';

let interval: NodeJS.Timeout;
let chartExtension: ChartExtension | undefined;
let data: ChartDataViewer[] = [];
let accordionComponent: Accordion | undefined;
let accordionElement: HTMLElement | undefined;
let isExtensionInitialized: boolean = false;

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
                    id: data.length,
                    duration,
                    nbViewer,
                    game,
                    time: new Date(),
                } as ChartDataViewer;

                chartExtension.addData({ ...newData });
                //chartExtension.addPeaks(peaks);
                data.push(newData);

            }
        }, 2000);
    }
};

const onClickArrowAccordionHandler = async () =>{
    const { isAccordionExpanded } = await getStorage(['isAccordionExpanded']);

    if (typeof isAccordionExpanded !== 'undefined' && accordionComponent) {
        await setStorage( {'isAccordionExpanded': !isAccordionExpanded} );
        isAccordionExpanded ? accordionComponent.collapseChartContainer() : accordionComponent.expandChartContainer();
    }
};

const initStorage = async (): Promise<void> => {
    try {
        const result = await getStorage(['isAccordionExpanded']);
        if (typeof result == 'undefined') {
            await setStorage( {'isAccordionExpanded': true} );
        } else {
            return;
        }
    } catch (error) {
        console.log(error);
    }
    
};

/**
 * Check if `#live-channel-stream-information` is in DOM or wait for it, then start getting datas and init chart
 */
const initChartInDOM = () => {
    console.log('initChartInDOM');
    isExtensionInitialized = true;
    waitForElm('#live-channel-stream-information').then(async (element: Element | null) => {
        startLoopGetData();
        initStorage();
        if (element && typeof accordionComponent == 'undefined' && typeof accordionElement == 'undefined' && document.getElementById("accordionExtension") === null) {
            const { isAccordionExpanded } = await getStorage(['isAccordionExpanded']);
    
            accordionComponent = new Accordion(element, onClickArrowAccordionHandler, isAccordionExpanded);
            accordionElement = accordionComponent.getChartContainer() as HTMLElement;
        }
        if (accordionElement && typeof chartExtension == 'undefined') {
            const chartTitle: string = formatChartTitle(window.location.pathname);
            const textColor: string = document.documentElement.className.includes('dark') ? '#ffffff' : '#000000';
            chartExtension = new ChartExtension(accordionElement, chartTitle, textColor);
            backGroundThemeObserver(document, updateDefaultColor);
        }
        
    });
};

chrome.runtime.onMessage.addListener((request, _sender) => { // When user goes from a Twitch URL to another Twitch URL
    console.log("Message received in contentScript:", request);

    if (isURLTwitch(request.url)) {

        if (chartExtension && formatChartTitle(window.location.pathname).includes(chartExtension.chartTitle.replace("'s viewers", ""))) return; // if page reloaded but still on same page, do not init another Chart

        if (chartExtension instanceof ChartExtension && accordionComponent instanceof Accordion && typeof accordionElement !== 'undefined') { // If Chart already exists in DOM
            chartExtension.destroy();
            accordionComponent.destroy();
            chartExtension = undefined;
            accordionComponent = undefined;
            accordionElement = undefined;
            isExtensionInitialized = false;
        } else {
            if (document.getElementById('accordionExtension') === null && document.getElementById('extensionChartContainer') === null && !isExtensionInitialized) {
                initChartInDOM();
            }
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
    if (document.getElementById('accordionExtension') === null && document.getElementById('extensionChartContainer') === null && !isExtensionInitialized) {
        initChartInDOM();
    }
    
});
