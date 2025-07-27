import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";
import { AudioBarsValue } from "../store/slices/audioBarsSlice";
import { useDispatch } from "react-redux";
import { clearSummariesExceptLast } from "../store/slices/summarizeSlice";

type SummaryHeaderProps = {
    onClickSummarizeHandler: (event: any) => Promise<void>,
    isSummarizing: boolean
}

const SummaryHeader: FC<SummaryHeaderProps> = ({ onClickSummarizeHandler, isSummarizing }: SummaryHeaderProps) => {

    const dispatch = useDispatch();
    const summaries = useAppSelector((state: RootState) => state.summarize.value);
    const language = useAppSelector((state: RootState) => state.language.value);
    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);

    const audioBars = useAppSelector((state: RootState) => state.audioBars.value);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [ open, setOpen ] = useState(false);

    const onClickClear = useCallback(() => {
        dispatch(clearSummariesExceptLast());
        setOpen(false);
    }, []);

    const downloadSummariesAsJson = useCallback(() => {
        const formattedTime = (date: number) => new Date(date).toLocaleTimeString(language, {
            hour12: language === 'en',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const formattedSummaries = summaries.map((item, index) => ({
            summaryNumber: index + 1,
            streamerName: item.streamerName ?? "N/A",
            time: formattedTime(item.time),
            text: item.text
        }));

        const jsonContent = JSON.stringify(formattedSummaries, null, 2);

        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "summaries.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [summaries, language]);


    useEffect(() => {
        // Close the dropdown if clicked elsewhere
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="mb-2 flex flex-row items-center">
            <h2 className="text-lg font-medium text-white">{ translatedText?.summarize?.message }</h2>
            <div className="grow" />
            <button onClick={(event) => onClickSummarizeHandler(event)} title={ isSummarizing ?  translatedText?.disable_summarize?.message  : translatedText?.enable_summarize?.message } className="inline-flex items-center justify-center shadow-lg w-8 h-8 font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:bg-gradient-to-bl rounded-full group focus:outline-none hover:shadow-xl" type="button">
                <svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    { audioBars.map(({ y, height }: AudioBarsValue, index: number) => <rect className="transition-[height,y] duration-[80ms]" x={ 8 * index } key={ index } fill="#ffffff" y={ y } width="4" height={ height }></rect>)  }
                </svg>
            </button>
            <div className="relative inline-block text-left ml-1" ref={ dropdownRef }>
                <button className="inline-flex items-center p-1 text-sm font-medium text-center rounded-lg text-gray-200 hover:text-white" onClick={() => setOpen((prev) => !prev)}>
                    <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
                    </svg>
                </button>
                {open && (
                <div className="absolute right-0 mt-1 w-28 z-50 bg-gray-600 rounded shadow-lg">
                    <ul className="text-sm text-white">
                        <li>
                            <button onClick={ () => downloadSummariesAsJson() } className="flex w-full items-center hover:bg-gray-400 px-2 py-2 rounded cursor-pointer" type="button">
                                <svg className="w-4 h-4 mr-3 mb-1 pointer-events-none text-gray-100" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"></path>
                                    <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
                                </svg>
                                <span>{ translatedText?.download?.message }</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={ () => onClickClear() } className="flex w-full items-center hover:bg-gray-400 px-2 py-2 rounded cursor-pointer border-solid border-t border-gray-400" type="button">
                                <svg className="w-4 h-4 mr-3 mb-1 text-gray-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd"></path>
                                </svg>
                                <span>{ translatedText?.clear?.message }</span>
                            </button>
                        </li>
                    </ul>
                </div>
                )}
            </div>
        </div>
    );
};

export { SummaryHeader }