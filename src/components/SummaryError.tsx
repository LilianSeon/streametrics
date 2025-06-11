import { FC } from "react";

// Store
import { useAppSelector } from "../store/hooks";

// Typings
import { RootState } from "../store/store";

type SummaryErrorProps = {
    isLast: boolean;
};

const SummaryError: FC<SummaryErrorProps> = ({ isLast }: SummaryErrorProps) => {

    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);
      
    return (
        <div>
            <div className="mx-auto my-3 p-4 rounded-lg min-w-[135px] bg-gray-900 border-gray-800">
                <div className="flex items-center space-x-2 mb-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-800 text-red-200 rounded-lg">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                        </svg>
                    </div>
                    <span className="text-base font-semibold text-white">{ translatedText.summarize_error_title.message }</span>
                </div>
                <p className="text-sm font-normal text-gray-100">{ translatedText.summarize_error_text.message }</p>
            </div>
            { !isLast && <hr className="h-px bg-gray-500 border-0" /> }
        </div>
    );
};

export { SummaryError }