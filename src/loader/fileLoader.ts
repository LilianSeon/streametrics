const loadMessages = async (key: string, lang: string): Promise<string> => {
    const response = await fetch(`/_locales/${lang}/messages.json`);
    const responseJSON = await response.json();
    return responseJSON[key]['message'];
};

export { loadMessages }