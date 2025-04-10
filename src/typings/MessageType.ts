export enum MessageEnum {
    addOneStreamer = 'addOneStreamer',
    updateStreamersList = 'updateStreamersList',
    deleteAllStreamers = 'deleteAllStreamers',
    getWindowId = 'getWindowId',
    getTabId = 'getTabId'
};


export interface ActionsHandler<TInput = any, TOutput = any> {
    (payload: TInput, sender: chrome.runtime.MessageSender): Promise<TOutput>;
  }

export interface MessageResquest<T = any> {
    action: MessageEnum,
    payload?: T
}