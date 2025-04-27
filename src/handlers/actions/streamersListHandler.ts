import { ActionsHandler } from "../../typings/MessageType";
import { StorageStreamerListType } from "../../typings/StorageType";


const addOneStreamer: ActionsHandler = async (payload: StorageStreamerListType, _sender?: chrome.runtime.MessageSender) => {

    const { streamersList }: { streamersList?: StorageStreamerListType[] } = await chrome.storage.local.get(['streamersList'])
    return new Promise((resolve, reject) => {
        if (streamersList && !streamersList.some(item => item.tabId === payload.tabId)) {
            streamersList.push(payload); 
            chrome.storage.local.set({ streamersList: streamersList })
                .then(() => {
                    chrome.action.setBadgeBackgroundColor({ color: '#60a5fa' });
                    chrome.action.setBadgeText({ text: `${ streamersList.length }` });
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

const updateStreamersList = async ({ tabId, payload }: { tabId: StorageStreamerListType['tabId'], payload: Partial<StorageStreamerListType> }, _sender?: chrome.runtime.MessageSender) => {

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
                chrome.action.setBadgeText({ text: '' }); // Remove badge
                resolve(true);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const deleteOneStreamer = async (payload: { tabId: number, removeInfo: chrome.tabs.TabRemoveInfo }, _sender?: chrome.runtime.MessageSender) => {
    // Delete streamer in streamerList storage
    const { streamersList } = await chrome.storage.local.get('streamersList');
    const streamerToDelete: StorageStreamerListType[] = streamersList.filter((streamer: StorageStreamerListType) => streamer.tabId !== payload.tabId || streamer.windowId !== payload.removeInfo.windowId);
    await chrome.storage.local.set({ 'streamersList': streamerToDelete });
    chrome.action.setBadgeText({ text: `${ streamerToDelete.length === 0 ? '' : streamerToDelete.length }` });
};

export { deleteOneStreamer, deleteAllStreamers ,addOneStreamer, updateStreamersList }