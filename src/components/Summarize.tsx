import { FC, useCallback, useEffect, useRef } from "react";

// Typings
import { SummarizeValue } from "../store/slices/summarizeSlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";

type SummarizeProps = {
    summaries: SummarizeValue[]
}

const Summarize: FC<SummarizeProps> = ({ summaries }: SummarizeProps) => {

    const language = useAppSelector((state: RootState) => state.language.value);

    const endOfListRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [summaries]);

    const formatTime = useCallback((time: SummarizeValue['time']) => {
        return new Date(time).toLocaleTimeString(language, {
            hour12: language === 'en',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }, [language]);

    return(
        <section className="m-2 p-2 flex flex-col grow bg-gray-800 rounded-lg min-h-0">
            <h2 className="mb-2 text-lg text-white">Summarize</h2>
            <div className="flex flex-col gap-2.5 grow min-h-0">
                <div className="flex flex-col w-full grow overflow-y-auto rounded-lg p-4 border-gray-200 bg-gray-700 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
                    {
                        summaries.map((summaries, index) => (
                            <div key={ index } className="py-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-normal text-gray-400 dark:text-gray-400">{ formatTime(summaries.time) }</span>
                                </div>
                                <p className="text-sm font-normal text-gray-100">{ summaries.text }</p>
                            </div>
                        ))
                    }
                    <div ref={endOfListRef} />
                </div>
            </div>
        </section>
    )
};

export { Summarize }