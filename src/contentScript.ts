// Utils
import { isURLTwitch, getNbViewer, waitForElm, getDuration, formatChartTitle, getGameName, backGroundThemeObserver, ThemeBackgroundColor, extractDataFromJSON, getChatContainer, downloadJSON, getStreamerName, isDarkModeActivated } from './utils/utils';
import { getStorage, setStorage } from './utils/utilsStorage'
import IntervalManager from './js/intervalManager';

// Components
import Accordion, { OnClickExportButtonHandler, OnClickPlayPauseButtonHandler, OnChangeImportHandler, OnClickClearButtonHandler, OnClickHideShowMessageButtonHandler, OnClickHideShowViewerButtonHandler } from './components/Accordion';
import { MessageCounter } from './js/messageCounter';
import Toast, { ToastMessage } from './components/Toast';
import ChartExtension, { ChartDataViewer } from './js/chartExtension';

// CSS
import './assets/css/index.css'; // Font


const DELAY_MS: number = 5000;

let chartExtension: ChartExtension | undefined;
//let data: ChartDataViewer[] = [];
let accordionComponent: Accordion | undefined;
//let toastComponent: Toast | undefined;
let accordionElement: HTMLElement | undefined;
let isExtensionInitialized: boolean = false;
let messageCounter: MessageCounter | undefined;
let loopCounter: number = 0;
let intervalManager: IntervalManager| undefined;
let hasImportedData: boolean = false;

/**
 * Get needed data then add it to the Chart
 */
const startLoopGetData = () => {
    const duration: string | undefined = getDuration(document);
    const nbViewer: number = getNbViewer(document);
    const game: string = getGameName(document);
    let messageAmount: number = 0;

    if (chartExtension && duration && nbViewer) {

        if (typeof messageCounter !== 'undefined') {
            messageAmount = messageCounter.getAmountOfNewMessages(messageCounter.previousMessagesCount);
        }

        //const peaks: Peak[] = computedDataLabel(data, nbViewer) || []; // return dataLabel if needed;

        const newData = {
            id: loopCounter,
            duration,
            nbViewer,
            game,
            time: new Date(),
        } as ChartDataViewer;

        // Update title if empty
        if (chartExtension.chartTitle === '') chartExtension.setTitle(formatChartTitle(window.location.pathname), false);

        chartExtension.addData(newData, messageAmount);
        //chartExtension.addPeaks(peaks);
        loopCounter++;

    }
};

const onClickArrowAccordionHandler = async (): Promise<void> => {
    const { isAccordionExpanded } = await getStorage(['isAccordionExpanded']);

    if (typeof isAccordionExpanded === 'undefined') await setStorage({ 'isAccordionExpanded': true });

    if (typeof isAccordionExpanded !== 'undefined' && accordionComponent) {
        await setStorage({ 'isAccordionExpanded': !isAccordionExpanded });
        isAccordionExpanded ? accordionComponent.collapseChartContainer() : accordionComponent.expandChartContainer();
    }
};

const onClickClearHandler: OnClickClearButtonHandler = () => {
    chartExtension?.clearData();
    chartExtension?.clearTitle();
    hasImportedData = false;
};

const onChangeImportHandler: OnChangeImportHandler = async (event: Event): Promise<void> => {
    if (chartExtension && intervalManager && accordionComponent) {
        try {
            const data = await extractDataFromJSON(event)
            const isDataImported = await chartExtension.importData(data);

            if (isDataImported) {
                new Toast('success', accordionComponent!.toastContainer, ToastMessage.importSuccess);
                intervalManager.clear();
                accordionComponent.isPlaying = false;
                hasImportedData = true;
            }
        } catch (error) {
            new Toast('error', accordionComponent!.toastContainer, ToastMessage.importError);
        }
    }
};

const onClickExportButtonHandler: OnClickExportButtonHandler = (): void => {
    if (chartExtension) downloadJSON(getStreamerName(document)+'_datas.json', chartExtension.getDatas());
};

const onClickHideShowViewerButtonHandler : OnClickHideShowViewerButtonHandler = (isDisplayViewer: boolean): void => {
    if (chartExtension && accordionComponent) {
        (isDisplayViewer) ? chartExtension.hideViewersCountDataset() : chartExtension.showViewersCountDataset();
        accordionComponent.isDisplayViewer = !isDisplayViewer;
    }
};

const onClickHideShowMessageButtonHandler : OnClickHideShowMessageButtonHandler = (isDisplayMessage: boolean): void => {
    if (chartExtension && accordionComponent) {
        (isDisplayMessage) ? chartExtension.hideMessagesCountDataset() : chartExtension.showMessagesCountDataset();
        accordionComponent.isDisplayMessage = !isDisplayMessage;
    }
};

const onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler = (isPlaying: boolean): void => {
    if (isPlaying) {
        intervalManager?.pause();
    } else {
        if (hasImportedData) {
            chartExtension?.clearData();
            chartExtension?.clearTitle();
        }
        intervalManager?.play();
        hasImportedData = false;
    }

    if (accordionComponent) accordionComponent.isPlaying = !isPlaying;
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
const initChartInDOM = async () => {
    console.log('initChartInDOM');
    isExtensionInitialized = true;
    const informationContainer = await waitForElm('#live-channel-stream-information');
    const chartContainer = await waitForElm('.chat-line__message');

    if (typeof messageCounter === 'undefined' && chartContainer) {
        messageCounter = new MessageCounter(getChatContainer(document));
    }

    if (typeof intervalManager === 'undefined') {
        intervalManager = new IntervalManager(startLoopGetData, DELAY_MS);
    }

    await initStorage();

    if (informationContainer && typeof accordionComponent == 'undefined' && typeof accordionElement == 'undefined' && document.getElementById("accordionExtension") === null) {
        const { isAccordionExpanded } = await getStorage(['isAccordionExpanded']);

        accordionComponent = new Accordion(informationContainer, onClickArrowAccordionHandler, onClickExportButtonHandler, onChangeImportHandler, onClickPlayPauseButtonHandler, onClickClearHandler, onClickHideShowMessageButtonHandler, onClickHideShowViewerButtonHandler, isAccordionExpanded);
        accordionElement = accordionComponent.getChartContainer() as HTMLElement;
    }
    if (accordionElement && typeof chartExtension == 'undefined') {
        const chartTitle: string = formatChartTitle(window.location.pathname);
        const textColor: string = document.documentElement.className.includes('dark') ? '#ffffff' : '#000000';
        chartExtension = new ChartExtension(accordionElement, chartTitle, textColor, navigator.language);
        backGroundThemeObserver(document, updateDefaultColor);
        updateDefaultColor(isDarkModeActivated() ? 'dark' : 'light');
    }
};

chrome.runtime.onMessage.addListener((request, _sender) => { // When user goes from a Twitch URL to another Twitch URL
    console.log("Message received in contentScript:", request);

    if (isURLTwitch(request.url)) {

        if (chartExtension && formatChartTitle(window.location.pathname).includes(chartExtension.chartTitle.replace("'s viewers", ""))) return; // if page reloaded but still on same page, do not init another Chart

        if (chartExtension instanceof ChartExtension && accordionComponent instanceof Accordion && typeof accordionElement !== 'undefined' && messageCounter && intervalManager instanceof IntervalManager) { // If Chart already exists in DOM
            chartExtension.destroy();
            accordionComponent.destroy();
            messageCounter.destroy();
            intervalManager.clear();
            intervalManager = undefined;
            messageCounter = undefined;
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
        let newColor: string;
        if (theme === 'dark') { // Dark mode
            newColor = '#ffffff';
            accordionComponent?.accordion?.classList.add('dark'); // Add dark css class for tailwind
        } else { // Light mode
            newColor = '#000000';
            accordionComponent?.accordion?.classList.remove('dark');
        }

        chartExtension.setDefaultColor(newColor);
    }
};


window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('accordionExtension') === null && document.getElementById('extensionChartContainer') === null && !isExtensionInitialized) {
        initChartInDOM();
    }
});
