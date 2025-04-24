import { FC, useMemo } from "react";

export interface NotFoundTextValueI18n {
    not_found_message: string,
    not_found_advise: string
}

type NotFoundProps = {
    notFoundTexts: NotFoundTextValueI18n,
    searchValue: string
}

const NotFound: FC<NotFoundProps> = ({ notFoundTexts, searchValue }: NotFoundProps) => {

    const imgSrcNotFound = useMemo(() => chrome.runtime.getURL('images/not_found-transparent.png'), []);

    return(
        <div className='flex flex-col justify-center items-center pt-2 pb-2 text-base text-gray-200'>
            <p className="flex justify-center items-center">
               <img className="my-auto h-[4.5rem] inline-block" src={ imgSrcNotFound } alt="No results found" /> 
            </p>
            <p className="flex justify-center items-center text-xl font-bold">{ notFoundTexts.not_found_message }</p>
            <p className="flex justify-center items-center">« { searchValue } »</p>
            <p className="flex justify-center items-center">{ notFoundTexts.not_found_advise }</p>
        </div>
    );
};

export { NotFound }