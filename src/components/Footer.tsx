import { FC, MouseEventHandler } from "react";

// Typings
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";


const Footer: FC = () => {

    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);

    const onClickLink: MouseEventHandler<HTMLAnchorElement> = () => {
        chrome.tabs.create({ active: true, url: "https://github.com/LilianSeon/streametrics/issues/new/choose" });
    };


    return(
        <footer className="max-w-screen-xl flex flex-wrap items-center p-4">
            <div className="grow"></div>
            <div className="text-gray-200">{ translatedText?.report_issue?.message } <a onClick={ onClickLink } className="text-blue-500 cursor-pointer hover:underline">{ translatedText?.open_issue?.message }</a></div>
        </footer>
    );
};

export { Footer }