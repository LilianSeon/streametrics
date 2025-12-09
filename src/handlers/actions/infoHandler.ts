import { ActionsHandler } from "../../typings/MessageType";

const getWindowId: ActionsHandler = async (_: any, sender?: chrome.runtime.MessageSender) => {
    return { windowId: sender?.tab?.windowId };
};

const getTabId: ActionsHandler = async (_: any, sender?: chrome.runtime.MessageSender) => {
    return { tabId: sender?.tab?.id };
};

const getCurrentTab: ActionsHandler = async (_: any, _sender?: chrome.runtime.MessageSender) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
};

export { getWindowId, getTabId, getCurrentTab }