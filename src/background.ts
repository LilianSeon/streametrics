/// <reference types="chrome"/>

let tabToUrl: any = {};

chrome.runtime.onMessage.addListener((request, _sender) => {
    console.log("Message received in background script:", request);

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



chrome.tabs.onRemoved.addListener((tabId: number) => {
    if (tabToUrl[tabId]!.startsWith("https://www.twitch.tv/")) {
        chrome.tabs.sendMessage(tabId, { closed: true}, (response) => { // Delete setInterval when closed
            console.log("Response from content script:", response);
        });
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

