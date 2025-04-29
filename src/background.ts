/// <reference types="chrome"/>

// Handlers
import { getI18nMessages } from "./handlers/actions/i18nMessagesHandler";
import { getWindowId, getTabId } from "./handlers/actions/infoHandler";
import { addOneStreamer, updateStreamersList, deleteAllStreamers, deleteOneStreamer } from "./handlers/actions/streamersListHandler";

// Typing
import { ActionsHandler, ActionsResquest } from "./typings/MessageType";

const actionsHandler: Record<string, ActionsHandler> = {
    addOneStreamer,
    updateStreamersList,
    deleteOneStreamer,
    deleteAllStreamers,
    getWindowId,
    getTabId,
    getI18nMessages
};


chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
    // When user install this extension for the first time set local storage
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await chrome.storage.local.set({ language: "en" });
        await chrome.storage.local.set({ isAccordionExpanded: true });
        await chrome.storage.local.set({ refreshValue: 5 });
        await chrome.storage.local.set({ isEnableExtension: true });
        await chrome.storage.local.set({ streamersList: [] });
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
};

chrome.tabs.onUpdated.addListener(async (tabID, { url }) => {
    if (url && isValidTwitchURL(url)) {
        chrome.tabs.sendMessage(tabID, { event: "onTabUpdated", payload: { url, tabID } });
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
    if (actionsHandler['deleteOneStreamer']) {
        actionsHandler['deleteOneStreamer']({ tabId, removeInfo });
    }
});
