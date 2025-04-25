import { checkStreamerStatus, getCurrentTabId, getGameName, getStreamerName } from "../../components/Chart/src/utils/utils";
import { getStorage } from "../../components/Chart/src/utils/utilsStorage";

const checkStatus = (_payload: any, sendResponse: (response?: any) => void) => {
    return new Promise(async(resolve, reject) => {
        const tabId = await getCurrentTabId();
        sendResponse(tabId);
        const streamerName = await getStreamerName(document);
        const streamerGame = await getGameName(document);
        const isStreamLive = checkStreamerStatus(document);
        const { language } = await getStorage(["language"]);
        const { status_inactive, status_active } = await chrome.runtime.sendMessage({ action: 'getI18nMessages', payload: { keys: isStreamLive ? ['status_active'] : ['status_inactive'], lang: language } });
    
        chrome.runtime.sendMessage({ action: 'updateStreamersList', payload: { tabId, payload: { streamerName, streamerGame, status: status_inactive ?? status_active  } }})
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });
    });
};


export { checkStatus }