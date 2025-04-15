import { Languages } from "../components/Chart/src/js/Texts";

/**
 * Loads a localized message.json by key for the specified language.
 *
 * @param { string } key - The key of the message to load.
 * @param { Languages } lang - The language code ('en', 'fr') to load the message for.
 * @returns { Promise<string> } A promise that resolves to the localized message string.
 */
const loadMessage = async <T extends string>(key: T, lang: Languages): Promise<string> => {
    const response = await fetch(`/_locales/${lang}/messages.json`);
    const responseJSON = await response.json();
    return responseJSON[key]['message'];
};

/**
 * Loads multiple localized messages by their keys for a given language.
 *
 * @template T - An array of string keys to load messages for.
 * @param { T } keys - An array of message keys to load.
 * @param { Languages } lang - The language code ('en', 'fr') to load the messages for.
 * @returns { Promise<Record<T[number], string>> } A promise that resolves to an object mapping each key to its localized message text.
 */
const loadMessages = async <T extends string[]>(keys: T, lang: Languages): Promise<Record<T[number], string>> => {
    const entries = await Promise.all(
        keys.map(async (key) => {
            const message = await loadMessage(key, lang);
            return [key, message] as const;
        })
    );

    return Object.fromEntries(entries) as Record<T[number], string>;
};

export { loadMessage, loadMessages }