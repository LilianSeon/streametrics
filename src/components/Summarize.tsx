import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Typings
import { SummarizeValue } from "../store/slices/summarizeSlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";
import { AudioBarsValue } from '../store/slices/audioBarsSlice';
import { StorageStreamerListType } from "../typings/StorageType";
import { loadMessage } from "../loader/fileLoader";
import { SummaryList } from "./SummaryList";
import { AutoScrollStopped } from "./AutoScrollStopped";

type SummarizeProps = {
    summaries: SummarizeValue[],
    audioBars: AudioBarsValue[],
    streamerName?: StorageStreamerListType["streamerName"],
    streamerImage?: StorageStreamerListType["streamerImage"],
    tabId?: StorageStreamerListType["tabId"],
    windowId?: StorageStreamerListType["windowId"]
}

const Summarize: FC<SummarizeProps> = ({ summaries, streamerName, audioBars, tabId, windowId }: SummarizeProps) => {

    const language = useAppSelector((state: RootState) => state.language.value);

    const [ summaryButtonTitleEnable, setSummaryButtonTitleEnable ] = useState('');
    const [ summaryButtonTitleDisable, setSummaryButtonTitleDisable ] = useState('');
    const [ isSummarizing, setIsSummarizing ] = useState<boolean>(true);
    const [ activeAutoScroll, setActiveAutoScroll ] = useState(true);

    const endOfListRef = useRef<HTMLDivElement | null>(null);

    const onScroll = useCallback((event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = event.currentTarget;

        const { scrollTop, scrollHeight, clientHeight } = target;

        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        setActiveAutoScroll(false);

        if (isAtBottom) {
            setActiveAutoScroll(true);
        }
    }, []);

    const nbSummary = useMemo(() => {
        if (!activeAutoScroll && summaries) return summaries.length;
    }, [activeAutoScroll]);

    const nbNewSummary = useMemo(() => {
        if (nbSummary) return summaries.length - nbSummary;
    }, [nbSummary, summaries]);

    useEffect(() => {
        if (activeAutoScroll) endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [summaries]);

    const stopTabCapture = useCallback(async (event: React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();
        await chrome.runtime.sendMessage({ action: 'stopTabCapture', payload: { shouldCloseSidePanel: false } });
    }, []);

    const focusTabAndStartTabCapture = useCallback(async (event: React.MouseEvent<Element, MouseEvent>, windowId: StorageStreamerListType['windowId'], tabId: StorageStreamerListType['tabId']) => {
        event.preventDefault();
        await chrome.runtime.sendMessage({ action: 'focusTab', payload: { tabId } });
        await chrome.runtime.sendMessage({ action: 'startTabCapture', payload: { shouldOpenSidePanel: false, windowId, tabId } });
    }, [windowId, tabId]);

    const onClickSummarizeHandler = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (isSummarizing) {
            await stopTabCapture(event);
        } else {
            if (windowId && tabId) await focusTabAndStartTabCapture(event, windowId, tabId);
        }
        setIsSummarizing(!isSummarizing);
    }, [windowId, tabId, isSummarizing]);

    const onClickBackToBottomHanlder = useCallback(() => {
        if (!activeAutoScroll) {
            endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeAutoScroll]);

    useEffect(() => {
        if (language) {
            loadMessage("summary_button_disable", language)
            .then((message) => {
                setSummaryButtonTitleDisable(message);
            });
            loadMessage("summary_button_enable", language)
            .then((message) => {
                setSummaryButtonTitleEnable(message);
            });
        }
    }, [language]);

    return(
        <section className="mt-2 mx-2 p-2 flex flex-col grow bg-gray-800 rounded-lg min-h-0">
            <div className="mb-2 flex flex-row items-center">
                <h2 className="text-lg font-medium text-white">Summarize</h2>
                <div className="grow"></div>
                <button onClick={ (event) => onClickSummarizeHandler(event) } title={ isSummarizing ? summaryButtonTitleDisable : summaryButtonTitleEnable } className="inline-flex items-center justify-center shadow-lg w-8 h-8 font-medium  bg-gradient-to-r from-cyan-500 to-blue-600 hover:bg-gradient-to-bl rounded-full group focus:outline-none hover:shadow-xl" type="button">
                    <svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        {
                            audioBars.map(({ y, height }: AudioBarsValue, index: number) => <rect className="transition-[height,y] duration-[80ms]" x={ 8 * index} key={ index } fill="#ffffff" y={ y } width="4" height={ height }></rect>)
                        }
                    </svg>
                </button>
            </div>
            
            <div className="group relative flex flex-col w-full rounded-lg overflow-y-auto gap-2.5 grow min-h-0">
                <div className="absolute top-0 left-0 right-0 h-8 rounded-t-lg pointer-events-none z-10 bg-gradient-to-b from-gray-700 to-transparent" />
                <div onScroll={ onScroll } className="group flex flex-col w-full grow overflow-y-auto rounded-lg p-4 border-gray-200 bg-gray-700 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-300 [&::-webkit-scrollbar-thumb]:ease-in-out group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <SummaryList summaries={ summaries } language={ language } currentStreamer={ streamerName ?? '' } />
                    { !activeAutoScroll && <AutoScrollStopped nbMessage={ nbNewSummary } onClick={ onClickBackToBottomHanlder }/> }
                    <div ref={endOfListRef} />
                </div>
            </div>
        </section>
    )
};

export { Summarize }