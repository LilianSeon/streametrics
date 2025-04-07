/// <reference types="chrome"/>

import { MessageEnum } from "./typings/MessageType";
import { StorageStreamerListType } from "./typings/StorageType";


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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    console.log('ONMESSAGE :', request, sender)
    if (request.text === MessageEnum.tabId && sender?.tab) { // Asking for tabId
        sendResponse({tab: sender.tab.id});
        return true;
    }

    if (request.text === MessageEnum.windowId && sender?.tab?.windowId) { // Asking for windowId
        sendResponse({ windowId: sender.tab.windowId });
        return true;
    }

    if (request.text === MessageEnum.deleteAllStreamers) { // Delete all streamer from streamersList
        chrome.storage.local.set({ streamersList: [] });
        sendResponse(true);
        return true;
    }

    if (request.text === MessageEnum.addOneStreamer && request?.payload) { // Delete one streamer from streamersList
        chrome.storage.local.get(['streamersList']).then(({ streamersList }: { streamersList?: StorageStreamerListType[] }) => {
            if (streamersList && !streamersList.some(item => item.tabId === request.payload.tabId)) {
                streamersList.push(request.payload); 
                chrome.storage.local.set({ streamersList: streamersList }).then(() => {
                    sendResponse(true);
                });
            } else {
                sendResponse(true);
            }
        });

        return true;
    }

    return false;
    
});

const isValidTwitchURL = (url: string) => {
    const urlPattern = /^(https):\/\/(www)\.(twitch)\.(tv)\/[-a-zA-Z0-9@:%._\+~#=]/;
    return urlPattern.test(url);
}

chrome.tabs.onUpdated.addListener(async (tabID, { url }, tab) => {
    if (url && isValidTwitchURL(url)) {
        chrome.tabs.sendMessage(tabID, { url: tab.url, event: "onUpdate" });
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    if (tab.pendingUrl && tab.pendingUrl.startsWith("https://www.twitch.tv/")) {
        chrome.tabs.sendMessage(tab.id!, { url: tab.pendingUrl, event: "onCreated" }, (response) => {
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

chrome.tabs.query({ url: "https://www.twitch.tv/*" }, function(tabs) {
    for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id!, { url: tab.url, event: "query" }, (response) => {
            console.log("Response from content script:", response);
        });
      }
 } );

