/// <reference types="chrome"/>

// Handlers
import { getWindowId, getTabId } from "./handlers/actions/infoHandler";
import { addOneStreamer, updateStreamersList, deleteAllStreamers } from "./handlers/actions/streamersListHandler";

// Typing
import { ActionsHandler, ActionsResquest } from "./typings/MessageType";
import { StorageStreamerListType } from "./typings/StorageType";

const actionsHandler: Record<string, ActionsHandler> = {
    addOneStreamer,
    updateStreamersList,
    deleteAllStreamers,
    getWindowId,
    getTabId
};


chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
    console.log('onInstalled', details)

    // When user install this extension for the first time set local storage
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await chrome.storage.local.set({ language: "en" });
        await chrome.storage.local.set({ isAccordionExpanded: true });
        await chrome.storage.local.set({ refreshValue: 5 });
        await chrome.storage.local.set({ isEnableExtension: true });
    }
});

chrome.runtime.onMessage.addListener((request: ActionsResquest, sender, sendResponse) => {

    const { action, payload } = request;

    if (actionsHandler[action]) {
        actionsHandler[action](payload, sender).then(sendResponse).catch((err) => {
          sendResponse({ error: err.message });
        });

        return true; // async response
    }

    return false;
    
});

const isValidTwitchURL = (url: string) => {
    const urlPattern = /^(https):\/\/(www)\.(twitch)\.(tv)\/[-a-zA-Z0-9@:%._\+~#=]/;
    return urlPattern.test(url);
}

chrome.tabs.onUpdated.addListener(async (tabID, { url }) => {
    if (url && isValidTwitchURL(url)) {
        chrome.tabs.sendMessage(tabID, { event: "onTabUpdated", payload: { url } });
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    if (tab.pendingUrl && isValidTwitchURL(tab.pendingUrl)) {
        chrome.tabs.sendMessage(tab.id!, { event: "onTabCreated", payload: { url: tab.pendingUrl } }, (response) => {
            console.log("Response from content script:", response);
        });
    }
});

chrome.tabs.onRemoved.addListener(async (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
    // Delete streamer in streamerList storage
    const { streamersList } = await chrome.storage.local.get('streamersList');
    const streamerToDelete: StorageStreamerListType[] = streamersList.filter((streamer: StorageStreamerListType) => streamer.tabId !== tabId || streamer.windowId !== removeInfo.windowId);
    await chrome.storage.local.set({ 'streamersList': streamerToDelete });
});
