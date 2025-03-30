import { StorageStreamerListType } from "../../../../typings/StorageType";

export type CallbackGetStorage = (items: {
    [key: string]: any;
}) => void;

const updateStreamersListStorage = (streamersList: StorageStreamerListType[], tabId: StorageStreamerListType['tabId'], payload: Partial<StorageStreamerListType>) => {
    return streamersList.map(streamer =>
        streamer.tabId === tabId
            ? { ...streamer, ...payload }
            : streamer
    );
};

const addStreamersListStorage = (streamersList: StorageStreamerListType[], newObj: StorageStreamerListType): StorageStreamerListType[] => {
    if (!streamersList.some(item => item.tabId === newObj.tabId)) {
        streamersList.push(newObj); // Push only if the tabId is unique
    }

    return streamersList;
};

/**
 * 
 * @param { string | string[] } keys ["yourKeysToGet"]
 * @returns { Promise<{[key: string]: any}> }
 */
const getStorage = async (keys: string | string[]): Promise<{[key: string]: any}> => await chrome.storage.local.get(keys);

/**
 * PERSISTENT Storage - Globally
 * Save data to storage across their browsers
 * @param { { [key: string]: any } } items
 */
const setStorage = async (items: { [key: string]: any}): Promise<void> => {
    try {
        await chrome.storage.local.set(items);
    } catch (error) {
        console.error(error);
    }
};

export { getStorage, setStorage, addStreamersListStorage, updateStreamersListStorage }
