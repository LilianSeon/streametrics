import { FC, useCallback, useEffect, useRef, useState } from "react";

// Typings
import { StorageStreamerListType } from "../typings/StorageType";
import { Languages } from "./Chart/src/js/Texts";
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";

export type TableRowsProps = {
    searchTextValue?: string,
    streamersList: StorageStreamerListType[],
    currentPage?: number,
    language?: Languages
}

const itemsPerPage = 3;

const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi'); // g: Finds all matches in the text + i: Makes the search case-insensitive.
    const parts = text.split(regex);
    return parts.map((part, index) =>
        regex.test(part) ? <span key={index} className="font-extrabold">{part}</span> : part
    );
};

const scrollToAnchor = () => {
    let anchor = document.querySelector("#accordionExtension");
    if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

const TableRows: FC<TableRowsProps> = ({ streamersList, currentPage = 1, searchTextValue = '' }: TableRowsProps) => {

    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);

    const [ open, setOpen ] = useState(false);

    const dropdownRef = useRef<HTMLTableCellElement>(null);

    const currentItems = streamersList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const onClickDisableHanlder = useCallback((tabId: StorageStreamerListType['tabId'], isEnable: StorageStreamerListType['isEnable']) => {
        chrome.tabs.sendMessage(tabId, { event: isEnable ? "disableChart" : "enableChart" });
    }, []);

    const onClickFocusHandler = useCallback(async (tabId: StorageStreamerListType['tabId'], windowId: StorageStreamerListType['windowId']) => {
        if (tabId) {
            // Active window
            await chrome.windows.update(windowId, { focused: true });

            // Active target tab
            await chrome.tabs.update(tabId, { active: true });

            chrome.scripting.executeScript({
                target: { tabId },
                func: scrollToAnchor
            });
        }
    }, []);

    const getPillColor = useCallback((status: StorageStreamerListType['status']): string => {
        switch (status) {
            case 'Active': return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
            case 'Actif': return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
            case 'Inactive': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
            case 'Inactif': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
            case 'Idle': return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
            case 'Pause': return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';
            default: return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
        }
    }, []);

    useEffect(() => {
        // Close the dropdown if clicked elsewhere
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return(
        <>
            { 
                currentItems?.map(({ streamerName, streamerGame, streamerImage, status, occurrences, tabId, isEnable, windowId }: StorageStreamerListType, index) => {

                    // Handle suffix streamer name : (x)
                    const displayedName = occurrences > 0 ? `${streamerName} (${occurrences})` : `${streamerName}`;

                    const isLastItem = index === currentItems.length - 1;
                    const shouldApplyRoundedClass = index % 3 === 2 || isLastItem;

                    return(
                        <tr key={ index }className={`${ index !== streamersList.length-1 && 'border-b' } border-gray-700 group rounded-br-lg`}>
                            <td className={`${ shouldApplyRoundedClass && 'rounded-bl-lg' } w-3/10 bg-gray-900 flex flex-row pl-2 pr-1 py-4 font-medium text-white/90 group-hover:text-white whitespace-nowrap items-center justify-center`}>
                                <img className="mr-2 rounded-full" src={ streamerImage } alt="Streamer avatar" width={ 20 } height={ 20 }/>
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px] cursor-default" title={ streamerName }>
                                 { highlightMatch(displayedName, searchTextValue) }
                                </div>
                            </td>
                            <td className="w-1/10 bg-gray-900 pl-1 pr-1 py-3 text-center">
                                <div title={ status } className={`${ getPillColor(status) } mr-1 ml-2 sm:ml-0 w-2 h-2 rounded-full inline-block`}></div>
                                <div className="hidden sm:inline-block group-hover:text-white cursor-default">{ status }</div>
                            </td>
                            <td className="w-3/10 bg-gray-900 py-3 text-center">
                                <div className="max-w-[6rem] sm:max-w-[19rem] md:max-w-[24rem] overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-white cursor-default" title={ streamerGame }>
                                 { highlightMatch(streamerGame, searchTextValue) }
                                </div>
                            </td>
                            <td ref={ dropdownRef } className={`${ shouldApplyRoundedClass && 'rounded-br-lg' } w-2/10 bg-gray-900 px-2 py-3 items-center justify-center group/dropdown relative`}>
                                <button onClick={() => setOpen((prev) => !prev)} className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-white rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>
                                { open && (
                                    <div className="absolute right-0 mt-1 w-28 z-50 bg-gray-600 rounded shadow-lg">
                                        <ul className="text-sm text-white">
                                            <li>
                                                <button onClick={ () => onClickFocusHandler(tabId, windowId) } className="flex w-full items-center hover:bg-gray-400 px-2 py-2 rounded cursor-pointer" type="button">
                                                    <svg className="w-4 h-4 mr-3 mb-1 pointer-events-none text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                                                    </svg>

                                                    <span>{ translatedText?.focus?.message }</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={ () => onClickDisableHanlder(tabId, isEnable)} className="flex w-full items-center hover:bg-gray-400 px-2 py-2 rounded cursor-pointer border-solid border-t border-gray-400" type="button">
                                                    { isEnable ? 
                                                    <svg className="w-4 h-4 mr-3 mb-1 pointer-events-none text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                                                    </svg> :
                                                    <svg className="w-4 h-4 mr-3 mb-1 pointer-events-none text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                                    </svg>
                                                    }
                                                    <span>{ isEnable ? translatedText?.disable?.message : translatedText?.enable?.message }</span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )
                })
            }
        </>
    );
};

export { TableRows }