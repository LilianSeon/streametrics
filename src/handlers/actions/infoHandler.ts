import { ActionsHandler } from "../../typings/MessageType";

const getWindowId: ActionsHandler = async (_: any, sender: chrome.runtime.MessageSender) => {
    return { windowId: sender?.tab?.windowId };
};

const getTabId: ActionsHandler = async (_: any, sender: chrome.runtime.MessageSender) => {
    return { tabId: sender?.tab?.id };
};

export { getWindowId, getTabId }