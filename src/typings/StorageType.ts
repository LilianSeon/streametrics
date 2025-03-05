export type StorageStreamerListType = {
    occurrences: number,
    streamerName: string,
    streamerImage: string,
    streamerGame: string,
    streamerURL: string,
    status: StorageStatusType,
    tabId: number,
    windowId: number
}

export type StorageStatusType = 'Active' | 'Inactive' | 'Idle'

export enum StorageNameType { 
    streamersList = 'streamersList'
}