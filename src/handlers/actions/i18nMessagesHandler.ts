import { Languages } from "../../components/Chart/src/js/Texts";
import { ActionsHandler } from "../../typings/MessageType";

const loadMessage = async <T extends string>(key: T, lang: Languages): Promise<string> => {
    const response = await fetch(`/_locales/${lang}/messages.json`);
    const responseJSON = await response.json();
    return responseJSON[key]['message'];
};

const loadMessages = async <T extends string[]>(keys: T, lang: Languages): Promise<Record<T[number], string>> => {
    const entries = await Promise.all(
        keys.map(async (key) => {
            const message = await loadMessage(key, lang);
            return [key, message] as const;
        })
    );

    return Object.fromEntries(entries) as Record<T[number], string>;
};

const getI18nMessages: ActionsHandler = async <T extends string[]>(payload: { keys: T, lang: string }, _sender?: chrome.runtime.MessageSender) => {

    return new Promise(async (resolve, reject) => {
        if (payload?.keys && payload?.lang) {
            const messages = await loadMessages(payload.keys, payload.lang as Languages)
            resolve(messages);
        } else {
            reject({ error: 'Cannot load messages'});
        }
    });
};

export { getI18nMessages }