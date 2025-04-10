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

const updateStreamersList = async ({ tabId, payload }: { tabId: StorageStreamerListType['tabId'], payload: Partial<StorageStreamerListType> }, _sender: chrome.runtime.MessageSender) => {

    const { streamersList }: { streamersList?: StorageStreamerListType[] } = await chrome.storage.local.get(['streamersList'])
    return new Promise((resolve, reject) => {

        if (typeof streamersList === 'undefined' || typeof tabId === 'undefined') reject();

        chrome.storage.local.set({ streamersList: streamersList?.map(streamer =>
            streamer.tabId === tabId
                ? { ...streamer, ...payload }
                : streamer
            )})
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const deleteAllStreamers = async () => {

    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ streamersList: [] })
            .then(() => {
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export { deleteAllStreamers ,addOneStreamer, updateStreamersList }