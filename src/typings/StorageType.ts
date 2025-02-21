export type StorageStreamerListType = {
    streamerName: string,
    streamerImage: string,
    streamerGame: string,
    status: StorageStatusType,
    tabId: number
}

export type StorageStatusType = 'Active' | 'Inactive' | 'Idle'

export enum StorageNameType { 
    streamersList = 'streamersList'
}