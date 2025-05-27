/// <reference types="chrome"/>

// Handlers
import { getI18nMessages } from "./handlers/actions/i18nMessagesHandler";
import { getWindowId, getTabId } from "./handlers/actions/infoHandler";
import { openSidePanel } from "./handlers/actions/openSidePanel";
import { addOneStreamer, updateStreamersList, deleteAllStreamers, deleteOneStreamer } from "./handlers/actions/streamersListHandler";
import { summarizeReady } from "./handlers/actions/summarizeReady";
import { startTabCapture } from "./handlers/actions/tabCapture";

// Typing
import { ActionsHandler, ActionsResquest } from "./typings/MessageType";

let isSidePanelOpen = false;


chrome.action.onClicked.addListener(async (tab) => {

  if (isSidePanelOpen) {
    chrome.sidePanel.setOptions({
      enabled: false
    });
    isSidePanelOpen = false;

    await chrome.runtime.sendMessage({
        action: 'stopRecording',
        target: 'offscreen'
      });
      
    await chrome.offscreen.closeDocument();

    return;
  } else {
    chrome.sidePanel.setOptions({
      enabled: true
    })
    chrome.sidePanel.open({ windowId: tab.windowId });
    isSidePanelOpen = true;

    // Create an offscreen document.
      chrome.offscreen.createDocument({
        url: 'offscreen.html',
        //@ts-ignore
        reasons: ['USER_MEDIA'],
        justification: 'Recording from chrome.tabCapture API'
      });
  }

    // Get a MediaStream for the active tab.
    chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, async (streamId) => {

      const resp: { streamerName: string, streamerGame: string, streamTitle: string, language: string } = await chrome.tabs.sendMessage(tab.id!, { event: "getInfo" })
      console.log("resp", resp)
      // Send the stream ID to the offscreen document to start recording.
      chrome.runtime.sendMessage({
          action: 'startRecording',
          target: 'offscreen',
          payload: { ...resp, streamId } 
      });
    });

  
});

const actionsHandler: Record<string, ActionsHandler> = {
    addOneStreamer,
    updateStreamersList,
    deleteOneStreamer,
    deleteAllStreamers,
    getWindowId,
    getTabId,
    getI18nMessages,
    startTabCapture,
    openSidePanel,
    summarizeReady
};

chrome.storage.onChanged.addListener(({ streamersList }) => {
      if (streamersList?.newValue) {
        chrome.action.setBadgeBackgroundColor({ color: '#60a5fa' });
        chrome.action.setBadgeText({ text: `${ streamersList.newValue.length === 0 ? '' : streamersList.newValue.length }` });
      }
});


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
