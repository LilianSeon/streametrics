import { FC, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Components
import { SummaryList } from "./SummaryList";
import { AutoScrollStopped } from "./AutoScrollStopped";
import { SummaryHeader } from "./SummaryHeader";

// Typings
import { addSummary, SummarizeValue } from "../store/slices/summarizeSlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";
import { StorageStreamerListType } from "../typings/StorageType";
import { ThreeDots } from "./ThreeDots";
import { useDispatch } from "react-redux";
import { updateIsSummarizing } from "../store/slices/isSummarizingSlice";


type SummarizeProps = {
    summaries: SummarizeValue[],
    streamerName?: StorageStreamerListType["streamerName"],
    streamerImage?: StorageStreamerListType["streamerImage"],
    tabId?: StorageStreamerListType["tabId"],
    windowId?: StorageStreamerListType["windowId"],
}

const Summarize: FC<SummarizeProps> = ({ summaries, streamerName, tabId, windowId }: SummarizeProps) => {

    const dispatch = useDispatch();
    const language = useAppSelector((state: RootState) => state.language.value);
    const isSummarizing = useAppSelector((state: RootState) => state.isSummarizing.value);
    const captureAllowed = useAppSelector((state: RootState) => state.captureAllowed.value);

    const [ activeAutoScroll, setActiveAutoScroll ] = useState(true);

    const endOfListRef = useRef<HTMLDivElement | null>(null);

    const onScroll = useCallback((event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const target = event.currentTarget;

        const { scrollTop, scrollHeight, clientHeight } = target;

        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 90;

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
        try {
            await chrome.runtime.sendMessage({ action: 'focusTab', payload: { tabId } });
            const resp2 = await chrome.runtime.sendMessage({ action: 'startTabCapture', payload: { shouldOpenSidePanel: false, windowId, tabId } });
            if(resp2?.error || !resp2) dispatch(updateIsSummarizing(false));
            dispatch(updateIsSummarizing(true));
        } catch (e) {
            dispatch(updateIsSummarizing(false));
        }
        
    }, [windowId, tabId]);

    const onClickSummarizeHandler = useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (isSummarizing) {
            await stopTabCapture(event);
            dispatch(updateIsSummarizing(false));
        } else {
            try {
                if (windowId && tabId) {
                    await focusTabAndStartTabCapture(event, windowId, tabId);
                } else {
                    dispatch(updateIsSummarizing(false));
                    dispatch(addSummary({ text: "", type: "error", time: new Date().getTime(), streamerName: '', streamerImage: '' }));
                }
            } catch (error: any) {
                dispatch(addSummary({ text: "", type: "error", time: new Date().getTime(), streamerName: '', streamerImage: '' }));
                dispatch(updateIsSummarizing(false));
            }
        }
    }, [windowId, tabId, isSummarizing]);

    const onClickBackToBottomHanlder = useCallback(() => {
        if (!activeAutoScroll) {
            endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeAutoScroll]);

    return(
        <section className="mt-2 mx-2 p-2 flex flex-col grow bg-gray-800 rounded-lg min-h-0">
            <SummaryHeader onClickSummarizeHandler={ onClickSummarizeHandler } isSummarizing={ isSummarizing } />
            <div className="group relative flex flex-col w-full rounded-lg overflow-y-auto gap-2.5 grow min-h-0">
                <div className="absolute top-0 left-0 right-0 h-8 rounded-t-lg pointer-events-none z-10 bg-gradient-to-b from-gray-700 to-transparent" />
                <div onScroll={ onScroll } className="group flex flex-col w-full grow overflow-y-auto rounded-lg p-4 border-gray-200 bg-gray-700 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-300 [&::-webkit-scrollbar-thumb]:ease-in-out group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <SummaryList summaries={ summaries } language={ language } currentStreamer={ streamerName ?? '' } />
                    { !activeAutoScroll && <AutoScrollStopped nbMessage={ nbNewSummary } onClick={ onClickBackToBottomHanlder }/> }
                    { isSummarizing && captureAllowed && summaries.length > 0 && <ThreeDots /> }
                    <div ref={endOfListRef} />
                </div>
            </div>
        </section>
    )
};

export { Summarize }