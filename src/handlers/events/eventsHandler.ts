import { checkChartIsPaused, checkStreamerStatus, getCurrentTabId, getGameName, getStreamerName, getStreamTitle } from "../../components/Chart/src/utils/utils";
import { getStorage } from "../../components/Chart/src/utils/utilsStorage";

const checkStatus = (_payload: any, sendResponse: (response?: any) => void) => {
    return new Promise(async(resolve, reject) => {
        const tabId = await getCurrentTabId();
        sendResponse(tabId);
        const streamerName = await getStreamerName(document);
        const streamerGame = await getGameName(document);
        const isStreamLive = checkStreamerStatus(document);
        const isPaused = checkChartIsPaused(document);
        const status = await getStatus(isStreamLive, isPaused);
    
        chrome.runtime.sendMessage({ action: 'updateStreamersList', payload: { tabId, payload: { streamerName, streamerGame, status } }})
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const getStatus = async (isStreamLive: boolean, isPaused: boolean): Promise<string> => {
    if (isPaused) return 'Pause';

    const { language } = await getStorage(["language"]);
    const { status_inactive, status_active } = await chrome.runtime.sendMessage({ action: 'getI18nMessages', payload: { keys: isStreamLive ? ['status_active'] : ['status_inactive'], lang: language } });

    return status_inactive ?? status_active;
};

const getInfo = (_payload?: any, sendResponse?: (response?: any) => void): Promise<{ streamerName: string, streamerGame: string, streamTitle: string, language: string } | false> => {
    return new Promise(async(resolve, reject) => {
        const streamerName = await getStreamerName(document);
        const streamerGame = await getGameName(document);
        const streamTitle = getStreamTitle(document);
        const { language } = await getStorage(["language"]);

        if (streamerName && streamerGame && streamTitle && language) {
            if (sendResponse) sendResponse({ streamerName, streamerGame, streamTitle, language });
            resolve({ streamerName, streamerGame, streamTitle, language });
        } else {
            if (sendResponse) sendResponse(false);
            reject(false)
        }
    });
};


export { getInfo, checkStatus }