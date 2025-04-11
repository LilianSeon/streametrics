export enum ActionsEnum {
    addOneStreamer = 'addOneStreamer',
    updateStreamersList = 'updateStreamersList',
    deleteAllStreamers = 'deleteAllStreamers',
    getWindowId = 'getWindowId',
    getTabId = 'getTabId'
};

export enum EventsEnum {
    checkStatus = 'checkStatus'
};


export interface ActionsHandler<TInput = any, TOutput = any> {
    (payload: TInput, sender: chrome.runtime.MessageSender): Promise<TOutput>;
}

export interface EventsHandler<TInput = any, TOutput = any> {
    (payload: TInput, sender: chrome.runtime.MessageSender): Promise<TOutput>;
}

export interface ActionsResquest<T = any> {
    action: ActionsEnum,
    payload?: T
}

export interface EventsResquest<T = any> {
    event: ActionsEnum,
    payload?: T
}