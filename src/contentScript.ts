/// <reference types="chrome"/>

// Utils
import { getStreamerImage, isURLTwitch, getNbViewer, waitForElm, getDuration, formatChartTitle, getGameName, backGroundThemeObserver, ThemeBackgroundColor, extractDataFromJSON, getChatContainer, downloadJSON, downloadImage, getStreamerName, isDarkModeActivated, wait, getCurrentTabId, getCurrentWindowId } from './components/Chart/src/utils/utils';
import { addStreamersListStorage, getStorage, setStorage } from './components/Chart/src/utils/utilsStorage';
import IntervalManager from './components/Chart/src/js/intervalManager';

// Components
import Accordion, { OnChangeRefreshValueHandler, OnClickExportButtonHandler, OnClickExportImageButtonHandler, OnClickPlayPauseButtonHandler, OnChangeImportHandler, OnClickClearButtonHandler, OnClickHideShowMessageButtonHandler, OnClickHideShowViewerButtonHandler } from './components/Chart/src/components/Accordion';
import { MessageCounter } from './components/Chart/src/js/messageCounter';
import { ToastMessage } from './components/Chart/src/components/Toast';
import ChartExtension, { ChartDataViewer, ChartDownLoadCallbacks } from './components/Chart/src/index';
import ToastManager from './components/Chart/src/js/toastManager';

// CSS
import './components/Chart/src/assets/css/index.css'; // Font

// Typing
import { StorageStreamerListType } from './typings/StorageType';


let chartExtension: ChartExtension | undefined;
//let data: ChartDataViewer[] = [];
let accordionComponent: Accordion | undefined;
//let toastComponent: Toast | undefined;
let accordionElement: HTMLElement | undefined;
let isExtensionInitialized: boolean = false;
let isExtensionInitializing: boolean = false;
let messageCounter: MessageCounter | undefined;
let loopCounter: number = 0;
let intervalManager: IntervalManager | undefined;
let hasImportedData: boolean = false;
let toastManager: ToastManager | undefined;

/**
 * Get needed data then add it to the Chart
 */
const startLoopGetData = async () => {
    const duration: string | undefined = getDuration(document);
    const nbViewer: number = getNbViewer(document);
    const game: string = await getGameName(document);
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
    if (typeof toastManager !== 'undefined') {
        toastManager.addToQueue('interactive', ToastMessage.interactiveMessage, ToastMessage.interactiveTitle, () => {
            chartExtension?.clearData();
            chartExtension?.clearTitle();
            hasImportedData = false;
        });
    }
};

const onChangeImportHandler: OnChangeImportHandler = async (event: Event): Promise<void> => {
    if (chartExtension && intervalManager && accordionComponent) {
        try {
            const data = await extractDataFromJSON(event, importCallbacks);
            const isDataImported = await chartExtension.importData(data);

            if (isDataImported) {
                toastManager?.addToQueue('success', ToastMessage.importSuccess);
                intervalManager.clear();
                accordionComponent.isPlaying = false;
                hasImportedData = true;
            }
        } catch (error) {
            toastManager?.addToQueue('error', ToastMessage.importErrorFormat);
        }
    }
};

const onChangeRefreshValue: OnChangeRefreshValueHandler = async (refreshValue: number) => {
    await setStorage({ 'refreshValue': refreshValue });
    intervalManager?.updateInterval(refreshValue * 1000);
    if (accordionComponent?.isPlaying) intervalManager?.resume(false);
};

const downLoadCallbacks: ChartDownLoadCallbacks = {
    loadstart: (progress) => {
        if (accordionComponent) accordionComponent.setProgressBarWidth(progress.loaded);
    },
    progress: (progress) => {
        if (accordionComponent) accordionComponent.setProgressBarWidth((progress.loaded/progress.total)*100);
    },
    loadend: () => {
        if (accordionComponent) accordionComponent.setProgressBarWidth(0);
    },
    error: () => {
        toastManager?.addToQueue('error', ToastMessage.downloadError);
    }
};

const importCallbacks : ChartDownLoadCallbacks = {
    ...downLoadCallbacks,
    error: () => {
        toastManager?.addToQueue('error', ToastMessage.importError);
    }
};

const onClickExportImageButtonHandler: OnClickExportImageButtonHandler = () => {
    const imageString = chartExtension?.exportImage();
    if (imageString) downloadImage(getStreamerName(document)+'_chart_image.png', imageString, downLoadCallbacks);
};

const onClickExportButtonHandler: OnClickExportButtonHandler = (): void => {
    if (chartExtension) downloadJSON(getStreamerName(document)+'_data.json', chartExtension.getDatas(), downLoadCallbacks);
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
        if (hasImportedData && chartExtension) {
            chartExtension.clearData();
            chartExtension.clearTitle();
        }
        intervalManager?.resume();
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

    try {
        console.log("%c 🚀 StreaMetrics Chrome extension initializing... ", "color: white; background-color: #2563eb; font-size: 14px; padding: 8px; border-radius: 4px;");
        isExtensionInitializing = true;
        const informationContainer = await waitForElm('#live-channel-stream-information');
        const chartContainer = await waitForElm('.chat-line__message');

        if (typeof messageCounter === 'undefined' && chartContainer) {
            messageCounter = new MessageCounter(getChatContainer(document));
        }

        await initStorage();

        if (informationContainer && informationContainer.parentNode && chartContainer && typeof accordionComponent == 'undefined' && typeof accordionElement == 'undefined' && document.getElementById("accordionExtension") === null) {
            const { isAccordionExpanded } = await getStorage(['isAccordionExpanded']);
            const { refreshValue } = await getStorage(['refreshValue']);

            if (typeof intervalManager === 'undefined') {
                intervalManager = new IntervalManager(startLoopGetData, (refreshValue ?? 5) * 1000);
            }

            accordionComponent = new Accordion(informationContainer, refreshValue ?? 5, onClickArrowAccordionHandler, onClickExportButtonHandler, onChangeImportHandler, onClickPlayPauseButtonHandler, onClickClearHandler, onClickHideShowMessageButtonHandler, onClickHideShowViewerButtonHandler, onClickExportImageButtonHandler, onChangeRefreshValue, isAccordionExpanded);
            accordionElement = accordionComponent.getChartContainer() as HTMLElement;
            accordionComponent.setProgressBarWidth(20);
        }
        
        if (accordionElement && typeof chartExtension == 'undefined') {

            const chartTitle: string = formatChartTitle(window.location.pathname);
            const textColor: string = document.documentElement.className.includes('dark') ? '#ffffff' : '#000000';
            const { language } = await getStorage(["language"]);
            chartExtension = new ChartExtension(accordionElement, chartTitle, textColor, language);
            isExtensionInitializing = false;
            isExtensionInitialized = true;
            accordionComponent?.setProgressBarWidth(60);
            backGroundThemeObserver(document, updateDefaultColor);
            updateDefaultColor(isDarkModeActivated() ? 'dark' : 'light');
            toastManager = new ToastManager(accordionComponent!.toastContainer);

            const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);


            const streamerName = await getStreamerName(document);
            accordionComponent?.setProgressBarWidth(70);
            const streamerImage = await getStreamerImage(document, streamerName);
            accordionComponent?.setProgressBarWidth(80);
            const streamerGame = await getGameName(document);
            accordionComponent?.setProgressBarWidth(90);
            const occurrences = streamersList?.filter((streamer) => streamer.streamerName === streamerName).length || 0;

            const tabId = await getCurrentTabId();
            const windowId = await getCurrentWindowId();

            if (streamersList && windowId) {
                const newList = addStreamersListStorage(streamersList as StorageStreamerListType[], { occurrences, streamerName, streamerImage, streamerGame, status: 'Active', tabId: tabId, windowId, streamerURL: document.URL })
                //streamersList.push({ streamerName, streamerImage, streamerGame, status: 'Active', tabId: tabId, windowId, streamerURL: document.URL });
                await setStorage({ 'streamersList': newList });
            } else if(windowId) {
                await setStorage({ 'streamersList': [{ streamerName, streamerImage, streamerGame, status: 'Active', tabId: tabId, windowId, streamerURL: document.URL }] as StorageStreamerListType[]});
            }

            await wait(100);
            accordionComponent?.setProgressBarWidth(100);
            await wait(70);
            accordionComponent?.setProgressBarWidth(0);
        }
    } catch (error) {
        isExtensionInitializing = false;
        isExtensionInitialized = false;
    }
    
    isExtensionInitializing = false;
};

chrome.storage.onChanged.addListener((changes) => {
    for (let [key, { newValue }] of Object.entries(changes)) {
      if (key === "language" && chartExtension) {
        chartExtension.language = newValue; // Update chart's language
      }
    }
});

chrome.runtime.onMessage.addListener(async (request, _sender) => { // When user goes from a Twitch URL to another Twitch URL
    console.log("Message received in contentScript:", request);

    if (request?.url && isURLTwitch(request.url)) {

        // if page reloaded but still on same page, do not init another Chart
        if (chartExtension && formatChartTitle(window.location.pathname).includes(chartExtension.chartTitle.replace("'s viewers", ""))) return;

        // If Chart already exists in DOM
        if (chartExtension && chartExtension instanceof ChartExtension && accordionComponent instanceof Accordion && typeof accordionElement !== 'undefined' && messageCounter && intervalManager instanceof IntervalManager) {
            
            const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);
            const tabId = await getCurrentTabId();
            const streamerToDelete: StorageStreamerListType[] | undefined = streamersList?.filter((streamer: StorageStreamerListType) => streamer.tabId !== tabId && streamer.streamerURL !== request.url);
            await setStorage({'streamersList': streamerToDelete});

            chartExtension?.destroy();
            accordionComponent?.destroy();
            messageCounter.destroy();
            intervalManager.clear();
            intervalManager = undefined;
            messageCounter = undefined;
            chartExtension = undefined;
            accordionComponent = undefined;
            accordionElement = undefined;
            isExtensionInitialized = false;
        }

        if (document.getElementById('accordionExtension') === null && document.getElementById('extensionChartContainer') === null && !isExtensionInitialized && !isExtensionInitializing) {
            initChartInDOM();
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
