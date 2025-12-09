import { FC, useMemo } from "react";

type AutoScrollStoppedProps = {
    onClick: React.MouseEventHandler<HTMLButtonElement>,
    nbMessage?: number
}

const AutoScrollStopped: FC<AutoScrollStoppedProps> = ({ onClick, nbMessage }: AutoScrollStoppedProps) => {

    const nbMessageString = useMemo(() => {
        if (!nbMessage) return undefined;
        return nbMessage > 99 ? '99+' : nbMessage.toString();
    }, [nbMessage]);

    return(
        <button type="button" onClick={ onClick } className="animate-fade-in group/backToBottom absolute opacity-0 border-[1px] border-white end-6 bottom-6 inline-flex items-center p-1 text-sm text-center text-white bg-gray-500 rounded-full">
            <svg className="opacity-100 w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#fff">
                <path fill-rule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v12.59l1.95-2.1a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 1 1 1.1-1.02l1.95 2.1V2.75A.75.75 0 0 1 10 2Z" clip-rule="evenodd" />
            </svg>
            {
                nbMessageString ? <div className={`absolute opacity-90 inline-flex items-center justify-center w-6 h-6 ${nbMessageString === '99+' ? 'text-[0.6rem]' : 'text-xs'} font-bold text-white bg-blue-600 border-[1px] border-white rounded-full -top-2 -end-2 group-hover/backToBottom:bg-blue-700`}>{ nbMessageString }</div> : <></>
            }
        </button>
    );
};

export { AutoScrollStopped }