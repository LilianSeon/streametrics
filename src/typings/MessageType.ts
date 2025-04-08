export enum MessageEnum {
    tabId = 'what is my tabId?',
    windowId = 'what is my windowId?',
    deleteAllStreamers = 'delete all streamers in storage',
    addOneStreamer = 'add one streamer'
};


export interface ActionsHandler<TInput = any, TOutput = any> {
    (payload: TInput, sender: chrome.runtime.MessageSender): Promise<TOutput>;
  }

export interface MessageResquest<T = any> {
    action: MessageEnum,
    payload?: T
}