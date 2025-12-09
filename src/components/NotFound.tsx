import { FC, useMemo } from "react";
import { RootState } from "../store/store";
import { useAppSelector } from "../store/hooks";

type NotFoundProps = {
    searchValue: string
}

const NotFound: FC<NotFoundProps> = ({ searchValue }: NotFoundProps) => {

    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);

    const imgSrcNotFound = useMemo(() => chrome.runtime.getURL('images/not_found-transparent.png'), []);

    return(
        <div className='flex flex-col justify-center items-center pt-2 pb-2 text-base text-gray-200'>
            <p className="flex justify-center items-center">
               <img className="my-auto h-[4.5rem] inline-block" src={ imgSrcNotFound } alt="No results found" /> 
            </p>
            <p className="flex justify-center items-center text-xl font-bold">{ translatedText?.not_found_message?.message }</p>
            <p className="flex justify-center items-center">« { searchValue } »</p>
            <p className="flex justify-center items-center">{ translatedText?.not_found_advise?.message }</p>
        </div>
    );
};

export { NotFound }