import { ActionsHandler } from "../typings/MessageType";
import { StorageStreamerListType } from "../typings/StorageType";


const addOneStreamer: ActionsHandler = async (payload: StorageStreamerListType, _sender: chrome.runtime.MessageSender) => {

    const { streamersList }: { streamersList?: StorageStreamerListType[] } = await chrome.storage.local.get(['streamersList'])
    return new Promise((resolve, reject) => {
        if (streamersList && !streamersList.some(item => item.tabId === payload.tabId)) {
            streamersList.push(payload); 
            chrome.storage.local.set({ streamersList: streamersList })
                .then(() => {
                    resolve(true);
                })
                .catch((error) => {
                    reject(error);
                });
        } else {
            reject({ error: 'Cannot add streamer'});
        }
    });
};

export { addOneStreamer }