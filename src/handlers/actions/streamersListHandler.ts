import { ActionsHandler } from "../../typings/MessageType";
import { StorageStreamerListType } from "../../typings/StorageType";

const checkStatusStreamers = async (streamersList: StorageStreamerListType[] | undefined) => {
    if (streamersList?.length === 0 || typeof streamersList === 'undefined') return [];

    let nbTab: number = 0;
    const allStreamerTabId: number[] = [];
    let checkStatusNoResponse: number = 0;

    const streamersList_1 = await new Promise<StorageStreamerListType[]>((resolve) => {
        streamersList?.forEach((streamer: StorageStreamerListType) => {
            chrome.tabs.sendMessage(streamer.tabId, { event: "checkStatus" }).then((response) => {
                nbTab++;
                if (typeof response === 'undefined' || chrome.runtime?.lastError) { // Script didn't load on this tab.
                    checkStatusNoResponse++;
                } else if (response) {
                    allStreamerTabId.push(response);
                }

                if (nbTab + checkStatusNoResponse === streamersList.length) resolve(streamersList);
            }).catch((_error: string) => {
                checkStatusNoResponse++;
                if (checkStatusNoResponse + allStreamerTabId.length === streamersList.length) resolve(streamersList);
            });
        });
    });

    const filteredStreamerList = streamersList_1.filter(({ tabId: tabId_1 }: StorageStreamerListType) => allStreamerTabId.includes(tabId_1));
    chrome.storage.local.set({ streamersList: filteredStreamerList });
    if (checkStatusNoResponse === streamersList_1.length) {
        chrome.storage.local.set({ streamersList: [] }); // If only get error response clear streamerlist
        return [];
    }

    if (filteredStreamerList) {
        return filteredStreamerList;
    }
};


const addOneStreamer: ActionsHandler = async (payload: StorageStreamerListType, _sender?: chrome.runtime.MessageSender) => {

    const { streamersList }: { streamersList?: StorageStreamerListType[] } = await chrome.storage.local.get(['streamersList'])
    const streamersListUpdated = await checkStatusStreamers(streamersList);

    let occurrences = 0;
    streamersListUpdated?.filter((streamer) => streamer.streamerName === payload.streamerName)?.forEach((streamer) => {
        occurrences = streamer.occurrences+1;
    });

    return new Promise((resolve, reject) => {
        if (streamersListUpdated && !streamersListUpdated.some(item => item.tabId === payload.tabId)) {
            streamersListUpdated.push({ ...payload, occurrences }); 
            chrome.storage.local.set({ streamersList: streamersListUpdated })
                .then(() => {
                    chrome.action.setBadgeBackgroundColor({ color: '#60a5fa' });
                    chrome.action.setBadgeText({ text: `${ streamersListUpdated.length }` });
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
};

export { deleteOneStreamer, deleteAllStreamers ,addOneStreamer, updateStreamersList }