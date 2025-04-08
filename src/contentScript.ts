/// <reference types="chrome"/>

// Utils
import { getStreamerImage, isURLTwitch, getNbViewer, waitForElm, getDuration, formatChartTitle, getGameName, backGroundThemeObserver, ThemeBackgroundColor, extractDataFromJSON, getChatContainer, downloadJSON, downloadImage, getStreamerName, isDarkModeActivated, getCurrentTabId, getCurrentWindowId, checkStreamerStatus } from './components/Chart/src/utils/utils';
import { getStorage, setStorage, updateStreamersListStorage } from './components/Chart/src/utils/utilsStorage';
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

let tabId: number | undefined;


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
    
        if (isNaN(nbViewer)) {
            intervalManager?.clear();
            await streamDisconnected();
        } else {

        }

};

const streamDisconnected = async () => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'updateStreamersList', payload: { tabId, payload:  { isEnable: false, status: 'Inactive' }}}, (isDone) => {
            resolve(isDone)
        });
    });
    
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

const onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler = async (isPlaying: boolean): Promise<void> => {
    const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);

    if (isPlaying) {
        intervalManager?.pause();

        if (streamersList && tabId) await setStorage({ 'streamersList': updateStreamersListStorage(streamersList, tabId, { status: 'Pause' }) });

    } else {
        if (hasImportedData && chartExtension) {
            chartExtension.clearData();
            chartExtension.clearTitle();
        }
        intervalManager?.resume();
        hasImportedData = false;
        
        const isStreamLive = checkStreamerStatus(document);
        if (streamersList && tabId) await setStorage({ 'streamersList': updateStreamersListStorage(streamersList, tabId, { status: isStreamLive ? 'Active' : 'Inactive' }) });
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
        const { isEnableExtension } = await getStorage(['isEnableExtension']);

        // Do not init if isEnableExtension storage variable is false. 
        if (typeof isEnableExtension !== 'undefined' && isEnableExtension === false) return;
        
        console.log("%c 🚀 StreaMetrics Chrome extension initializing... ", "color: white; background-color: #2563eb; font-size: 14px; padding: 8px; border-radius: 4px;");
        tabId = await getCurrentTabId();
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
        console.log('INIT 20% :', accordionElement, chartExtension)
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
            const windowId = await getCurrentWindowId();

            if(windowId) await addOneStreamer({ occurrences, streamerName, streamerImage, streamerGame, status: 'Active', tabId, windowId, streamerURL: document.URL, isEnable: true })
            

            accordionComponent?.setProgressBarWidth(100);
            accordionComponent?.setProgressBarWidth(0);
            console.log("%c ⚡ StreaMetrics Chrome extension started ✨ ", "color: white; background-color: #65a30d; font-size: 14px; padding: 8px; border-radius: 4px;");
        }
    } catch (error) {
        isExtensionInitializing = false;
        isExtensionInitialized = false;
    }
    
    isExtensionInitializing = false;
};

const addOneStreamer = async (newStreamer: StorageStreamerListType) => {
    
    return new Promise((resolve) => {
        /*chrome.runtime.sendMessage({ text: 'add one streamer', payload: newStreamer }, (isDone) => {
            resolve(isDone);
        });*/
        chrome.runtime.sendMessage({ action: 'addOneStreamer', payload: newStreamer }, (isDone) => {
            resolve(isDone);
        });
    });
}

chrome.storage.onChanged.addListener((changes) => {
    for (let [key, { newValue }] of Object.entries(changes)) {
      if (key === "language" && chartExtension) {
        chartExtension.language = newValue; // Update chart's language
      }

      if (key === "isEnableExtension") {
        if(newValue === false) { //TODO: Action Destroy from background.js
            destroy();
        }
      }
    }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => { // When user goes from a Twitch URL to another Twitch URL
    (async () => {
        const { isEnableExtension } = await getStorage(['isEnableExtension']);

        // Do not init if isEnableExtension storage variable is false. 
        if (typeof isEnableExtension !== 'undefined' && isEnableExtension === false) return true;
    
        console.log("Message received in contentScript:", request);
    
        if (request.event === 'disable_chart') {
            destroy();
    
            const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);
            if (streamersList && tabId) await setStorage({ 'streamersList': updateStreamersListStorage(streamersList, tabId, { isEnable: false, status: 'Inactive' }) });
            sendResponse();
            return true;
        }
    
        if (request.event === 'enable_chart') {
            await initChartInDOM();
    
            const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);
            const isStreamLive = checkStreamerStatus(document);
            if (streamersList && tabId) await setStorage({ 'streamersList': updateStreamersListStorage(streamersList, tabId, { isEnable: true, status: isStreamLive ? 'Active' : 'Inactive' }) });
            sendResponse();
            return true;
        }
    
        if (request.event === 'check_status') {
            sendResponse(tabId);
    
            const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);
           
            tabId = await getCurrentTabId();
            const streamerName = await getStreamerName(document);
            const streamerGame = await getGameName(document);
            const isStreamLive = checkStreamerStatus(document);
    
            if (streamersList && tabId) await setStorage({ 'streamersList': updateStreamersListStorage(streamersList, tabId, { streamerName, streamerGame, status: isStreamLive ? 'Active' : 'Inactive' }) });
            
            return true;
        }
    
        if (request?.url && isURLTwitch(request.url)) {
    
            // if page reloaded but still on same page, do not init another Chart
            if (chartExtension && formatChartTitle(window.location.pathname).includes(chartExtension.chartTitle.replace("'s viewers", ""))) return true;
    
            // If Chart already exists in DOM
            if (chartExtension && chartExtension instanceof ChartExtension && accordionComponent instanceof Accordion && typeof accordionElement !== 'undefined' && messageCounter && intervalManager instanceof IntervalManager) {
                
                deleteStreamersListStorage(request.url);
                destroy();
            }
    
            if (document.getElementById('accordionExtension') === null && document.getElementById('extensionChartContainer') === null && !isExtensionInitialized && !isExtensionInitializing) {
                await initChartInDOM();
            }

            sendResponse();
            
            return true;
        }
    })();
    return true;
});

const deleteStreamersListStorage = async (url: StorageStreamerListType['streamerURL']) => {
    const { streamersList }: { streamersList?: StorageStreamerListType[] } = await getStorage(['streamersList']);
    const tabId = await getCurrentTabId();
    const streamerToDelete: StorageStreamerListType[] | undefined = streamersList?.filter((streamer: StorageStreamerListType) => streamer.tabId !== tabId && streamer.streamerURL !== url);
    await setStorage({'streamersList': streamerToDelete});
};

const destroy = () => {
    chartExtension?.destroy();
    accordionComponent?.destroy();
    messageCounter?.destroy();
    intervalManager?.clear();
    intervalManager = undefined;
    messageCounter = undefined;
    chartExtension = undefined;
    accordionComponent = undefined;
    accordionElement = undefined;
    isExtensionInitialized = false;
};

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


window.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('accordionExtension') === null && document.getElementById('extensionChartContainer') === null && !isExtensionInitialized) {
        await initChartInDOM();
    }
});
