/// <reference types="chrome"/>

import { MessageEnum } from "./typings/MessageType";
import { StorageStreamerListType } from "./typings/StorageType";

let tabToUrl: any = {};

chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
    console.log('onInstalled', details)

    // When user install this extension for the first time set local storage
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await chrome.storage.local.set({ language: "en" });
        await chrome.storage.local.set({ isAccordionExpanded: true });
        await chrome.storage.local.set({ refreshValue: 5 });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.text === MessageEnum.tabId && sender?.tab) { // Asking for tabId
        sendResponse({tab: sender.tab.id});
    }
});

chrome.tabs.onUpdated.addListener((tabId, _changeInfo, tab) => {
    if (tab.url!.startsWith("https://www.twitch.tv/") && tab.status === 'complete') {
        console.log("onUpdated", tabId)
        chrome.tabs.sendMessage(tabId, { url: tab.url, event: "onUpdate" }, (response) => {
            console.log("Response from content script:", response);
        });
        tabToUrl[tabId] = tab.url;
    }
});

chrome.tabs.onCreated.addListener((tab) => {
    console.log("onCreated", tab)
    if (tab.pendingUrl && tab.pendingUrl.startsWith("https://www.twitch.tv/")) {
        chrome.tabs.sendMessage(tab.id!, { url: tab.pendingUrl, event: "onCreated" }, (response) => {
            console.log("Response from content script:", response);
        });
        tabToUrl[tab.id!] = tab.pendingUrl;
    }
});



chrome.tabs.onRemoved.addListener(async (tabId: number) => {
    if (tabToUrl.hasOwnProperty(tabId) && tabToUrl[tabId]!.startsWith("https://www.twitch.tv/")) {
        chrome.tabs.sendMessage(tabId, { closed: true}, (response) => { // Delete setInterval when closed
            console.log("Response from content script:", response);
        });

        // Delete streamer in streamerList storage
        const { streamersList } = await chrome.storage.local.get('streamersList');
        const streamerToDelete: StorageStreamerListType[] = streamersList.filter((streamer: StorageStreamerListType) => streamer.tabId !== tabId);
        await chrome.storage.local.set({ 'streamersList': streamerToDelete });
    }
});

chrome.tabs.query({ url: "https://www.twitch.tv/*" }, function(tabs) {
    console.log("query", tabs);
    for (const tab of tabs) {
        console.log("query", tab.url);
        chrome.tabs.sendMessage(tab.id!, { url: tab.url, event: "query" }, (response) => {
            console.log("Response from content script:", response);
        });
      }
 } );

