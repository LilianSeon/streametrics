import { Languages } from "../components/Chart/src/js/Texts";
import { TranslatedText } from "../store/slices/translatedTextSlice";

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

/**
 * Loads the `messages.json` translation file for the specified language
 * from the `_locales` directory (typically used in Chrome extensions).
 *
 * @param { Languages } lang - The language code to load ("en", "fr" ...).
 * @returns { Promise<Record<string, { message: string, description?: string }>> }
 * A promise that resolves to an object containing localized messages.
 *
 * @example
 * const messages = await loadTranslatedText("en");
 * console.log(messages.hello.message); // "Hello"
 */
const loadTranslatedText = async (lang: Languages): Promise<TranslatedText> => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`/_locales/${lang}/messages.json`);
            const responseJSON = await response.json();

            resolve(responseJSON);
        } catch (e) {
            reject(e);
        }
    });
}

export { loadMessage, loadMessages, loadTranslatedText }