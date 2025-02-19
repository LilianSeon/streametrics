
export type CallbackGetStorage = (items: {
    [key: string]: any;
}) => void;

/**
 * 
 * @param { string | string[] } keys ["yourKeysToGet"]
 * @returns { Promise<{[key: string]: any}> }
 */
const getStorage = async (keys: string | string[]): Promise<{[key: string]: any}> => await chrome.storage.local.get(keys);

/**
 * PERSISTENT Storage - Globally
 * Save data to storage across their browsers
 * @param { { [key: string]: any } } items
 */
const setStorage = async (items: { [key: string]: any}): Promise<void> => {
    try {
        await chrome.storage.local.set(items);
    } catch (error) {
        console.error(error);
    }
};

export { getStorage, setStorage }
