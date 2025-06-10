/// <reference types="chrome"/>

// Handlers
import { getI18nMessages } from "./handlers/actions/i18nMessagesHandler";
import { getWindowId, getTabId, getCurrentTab } from "./handlers/actions/infoHandler";
import { openSidePanel } from "./handlers/actions/openSidePanel";
import { addOneStreamer, updateStreamersList, deleteAllStreamers, deleteOneStreamer } from "./handlers/actions/streamersListHandler";
import { focusTab, shouldStopCapture, startTabCapture, stopTabCapture } from "./handlers/actions/tabCapture";

// Typing
import { ActionsHandler, ActionsResquest } from "./typings/MessageType";

let isSidePanelOpen = false;


chrome.action.onClicked.addListener(async (tab) => {
  if (isSidePanelOpen) {
    await stopTabCapture({ shouldCloseSidePanel: true });
   // isSidePanelOpen = false;
  } else {
    chrome.storage.local.set({ sidePanelOpenedFrom: tab });
    try {
      await startTabCapture({ tab, shouldOpenSidePanel: true });
      await chrome.storage.local.set({ captureAllowed: true });
      //isSidePanelOpen = true;
    } catch (e) {
      console.log('Try startTabCapture error :', e)
      await chrome.storage.local.set({ captureAllowed: false });
      //isSidePanelOpen = true;
    }
    
  }
});

const actionsHandler: Record<string, ActionsHandler> = {
    addOneStreamer,
    updateStreamersList,
    deleteOneStreamer,
    deleteAllStreamers,
    shouldStopCapture,
    getWindowId,
    getTabId,
    getI18nMessages,
    openSidePanel,
    stopTabCapture,
    startTabCapture,
    focusTab,
    getCurrentTab
};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel") {

    port.onDisconnect.addListener(async () => {
      isSidePanelOpen = false;
      await stopTabCapture({ shouldCloseSidePanel: false });
    });
  }
});

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
        await chrome.storage.local.set({ captureAllowed: true });
        await chrome.storage.local.set({ streamersList: [] });
    }
});

chrome.runtime.onMessage.addListener((request: ActionsResquest, sender, sendResponse) => {

    const { action, payload } = request;

    if (action === 'isSidePanelOpened') {
      isSidePanelOpen = payload;
    }

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
    if (actionsHandler['deleteOneStreamer'] && actionsHandler['shouldStopCapture']) {
        actionsHandler['deleteOneStreamer']({ tabId, removeInfo });
        actionsHandler['shouldStopCapture']({ tabId, removeInfo });
    }
});
