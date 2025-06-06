import { ActionsHandler } from "../../typings/MessageType";

type startTabCapturePayload = {
    tab?: chrome.tabs.Tab;
    tabId?: number;
    windowId?: number;
    shouldOpenSidePanel?: boolean;
}

const focusTab: ActionsHandler = async ({ tabId }: { tabId: number }, _sender?: chrome.runtime.MessageSender) => {

    return new Promise(async (resolve, reject) => {
        try {
            chrome.tabs.update(tabId, { active: true }, () => {
                resolve(true);
            });
        } catch (e) {
            reject(e);
        }
    });
};

const openSidePanel = async (tab: chrome.tabs.Tab) => {
    chrome.sidePanel.setOptions({
        enabled: true
    });

    chrome.sidePanel.open({ windowId: tab.windowId });
};

const closeSidePanel = async () => {
    chrome.sidePanel.setOptions({
        enabled: false
    });
};

const startTabCapture: ActionsHandler = async ({ tab, tabId, windowId, shouldOpenSidePanel }: startTabCapturePayload, sender?: chrome.runtime.MessageSender) => {

    return new Promise(async (resolve, reject) => {
       
        try {
            if (!tab && sender) {
                tab = sender!.tab
            }

            if (!tab && windowId && tabId) {
                tab = {
                    windowId,
                    id: tabId
                } as chrome.tabs.Tab
            }

            if (typeof tab == 'undefined') {
                reject(false);
                return;
            }

            if (shouldOpenSidePanel) await openSidePanel(tab);

            const hasDocument = await chrome.offscreen.hasDocument();

            if (!hasDocument) {
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

                const resp: { streamerName: string, streamerGame: string, streamTitle: string, language: string } = await chrome.tabs.sendMessage(tab!.id!, { event: "getInfo" })
                console.log("resp", resp)
                // Send the stream ID to the offscreen document to start recording.
                chrome.runtime.sendMessage({
                    action: 'startRecording',
                    target: 'offscreen',
                    payload: { ...resp, streamId, tabId: tab!.id! } 
                });

                await chrome.storage.local.set({ isSummarizing: true });

                resolve(true);
            });
        } catch(e) {
            reject(e);
        }
    });
};

type stopTabCapturePayload = {
    shouldCloseSidePanel?: boolean;
}

const stopTabCapture: ActionsHandler = async ({ shouldCloseSidePanel }: stopTabCapturePayload, _sender?: chrome.runtime.MessageSender) => {

    return new Promise(async (resolve, reject) => {
        try {

            await chrome.runtime.sendMessage({ action: 'drawAudioBars', payload: { bars: [{ y: '9.00', height: '2.00' }, { y: '9.00', height: '2.00' }, { y: '9.00', height: '2.00' }], pulse: 1 }});

            await chrome.runtime.sendMessage({
                action: 'stopRecording',
                target: 'offscreen'
            });

            await chrome.storage.local.set({ isSummarizing: false });

            if (shouldCloseSidePanel) await closeSidePanel();
            
            await chrome.offscreen.closeDocument();
            resolve(true);
        } catch (e) {
            reject(e)
        }
    });
};

const shouldStopCapture: ActionsHandler = async (payload: { tabId: number, removeInfo: chrome.tabs.TabRemoveInfo }, _sender?: chrome.runtime.MessageSender) => {
    const { streamersList } = await chrome.storage.local.get('streamersList');
    const { sidePanelOpenedFrom } = await chrome.storage.local.get('sidePanelOpenedFrom');
    const isListeningTab = streamersList.some((streamer: any) => streamer.tabId === sidePanelOpenedFrom.id && sidePanelOpenedFrom.id === payload.tabId);
    await chrome.storage.local.set({ isSummarizing: !isListeningTab });

    if (isListeningTab) await stopTabCapture({ shouldCloseSidePanel: false });
};

export { startTabCapture, stopTabCapture, focusTab, shouldStopCapture }