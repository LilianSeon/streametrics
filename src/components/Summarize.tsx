import { FC, useCallback, useEffect, useRef } from "react";

// Typings
import { SummarizeValue } from "../store/slices/summarizeSlice";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";
import { AudioBarsValue } from '../store/slices/audioBarsSlice';

type SummarizeProps = {
    summaries: SummarizeValue[],
    audioBars: AudioBarsValue[]
}

const Summarize: FC<SummarizeProps> = ({ summaries, audioBars }: SummarizeProps) => {

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
            <div className="mb-2 flex flex-row items-center">
                <h2 className="text-lg font-medium text-white">Summarize</h2>
                <div className="grow"></div>
                <button className="inline-flex items-center justify-center w-8 h-8 font-medium bg-blue-600 rounded-full hover:bg-blue-700 group focus:outline-none" type="button">
                    <svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        {
                            audioBars.map(({ y, height }: AudioBarsValue, index: number) => <rect className="transition-[height,y] duration-100" x={ 8 * index} key={ index } fill="#ffffff" y={ y } width="4" height={ height }></rect>)
                        }
                    </svg>
                </button>
                
            </div>
            
            <div className="flex flex-col gap-2.5 grow min-h-0">
                <div className="flex flex-col w-full grow overflow-y-auto rounded-lg p-4 border-gray-200 bg-gray-700 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
                    {
                        summaries.map((summarie, index) => (
                            <div key={ index } className="py-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-normal text-gray-400 dark:text-gray-400">{ formatTime(summarie.time) }</span>
                                </div>
                                <p className="text-base font-normal text-gray-100">{ summarie.text }</p>
                                {
                                    summaries.length-1 !== index && <hr className="h-px my-3 bg-gray-500 border-0"></hr>
                                }
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