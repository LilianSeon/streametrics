import { FC, useCallback } from "react";

// Store
import { useAppSelector } from "../store/hooks";

// Typings
import { RootState } from "../store/store";

type SummaryErrorProps = {
    isLast: boolean;
};

const SummaryError: FC<SummaryErrorProps> = ({ isLast }: SummaryErrorProps) => {

    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);

    const onClickCloseWindow = useCallback(async (event: React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();
        await chrome.runtime.sendMessage({ action: 'closeSidePanel' });
    }, []);
      
    return (
        <div>
            <div className="mx-auto my-3 p-4 rounded-lg min-w-[135px] bg-gray-900 border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-800 text-red-200 rounded-lg">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                        </svg>
                    </div>
                    <span className="text-lg font-semibold text-white">{ translatedText.summarize_error_title.message }</span>
                </div>
                <p className="text-base font-normal text-gray-100">{ translatedText.summarize_error_text.message }</p>
                <div className="flex justify-end mt-3">
                    <button onClick={ onClickCloseWindow } className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-500 hover:to-orange-400 text-white focus:ring-1 focus:outline-none focus:ring-pink-800">
                        <span className="relative inline-flex pl-4 pr-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md hover:bg-transparent">
                            <svg className="w-4 h-4 mt-[2px] mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                            { translatedText.button_close.message }
                        </span>
                    </button>
                </div>
            </div>
            { !isLast && <hr className="h-px bg-gray-500 border-0" /> }
        </div>
    );
};

export { SummaryError }