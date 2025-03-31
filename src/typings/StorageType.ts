export type StorageStreamerListType = {
    occurrences: number,
    streamerName: string,
    streamerImage: string,
    streamerGame: string,
    streamerURL: string,
    status: StorageStatusType,
    isEnable: boolean,
    tabId: number,
    windowId: number
}

export type StorageStatusType = 'Active' | 'Inactive' | 'Idle' | 'Pause'

export enum StorageNameType { 
    streamersList = 'streamersList'
}