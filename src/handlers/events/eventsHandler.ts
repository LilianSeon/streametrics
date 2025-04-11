import { checkStreamerStatus, getCurrentTabId, getGameName, getStreamerName } from "../../components/Chart/src/utils/utils";

const checkStatus = (_payload: any, sendResponse: (response?: any) => void) => {
    return new Promise(async(resolve, reject) => {
        const tabId = await getCurrentTabId();
        sendResponse(tabId);
        const streamerName = await getStreamerName(document);
        const streamerGame = await getGameName(document);
        const isStreamLive = checkStreamerStatus(document);
        chrome.runtime.sendMessage({ action: 'updateStreamersList', payload: { tabId, payload: { streamerName, streamerGame, status: isStreamLive ? 'Active' : 'Inactive' } }})
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });
    });
};


export { checkStatus }