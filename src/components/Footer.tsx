import { FC, MouseEventHandler, useEffect, useState } from "react";

// Typings
import { Languages } from "./Chart/src/js/Texts";
import { loadMessages } from "../loader/fileLoader";


const i18nKeys = ["open_issue", "report_issue"];

interface FooterTextValueI18n {
    open_issue: string,
    report_issue: string
};

export interface FooterProps {
    language?: Languages
};

const Footer: FC<FooterProps> = ({ language }:FooterProps) => {

    const [ textValue, setTextValue ] = useState<FooterTextValueI18n>({ open_issue: '', report_issue: ''});

    const onClickLink: MouseEventHandler<HTMLAnchorElement> = () => {
        chrome.tabs.create({ active: true, url: "https://github.com/LilianSeon/streametrics/issues/new/choose" });
    };

    useEffect(() => {
        if (language) {
            loadMessages(i18nKeys, language)
            .then((message) => {
                setTextValue((textValue) => { return { ...textValue, ...message }});
            });
        }
    }, [language]);

    return(
        <footer className="max-w-screen-xl flex flex-wrap items-center mx-auto p-4">
            <div className="grow"></div>
            <div className="text-gray-200">{ textValue.report_issue } <a onClick={ onClickLink } className="text-blue-500 cursor-pointer hover:underline">{ textValue.open_issue }</a></div>
        </footer>
    );
};

export { Footer }