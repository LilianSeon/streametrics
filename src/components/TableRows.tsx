import { FC } from "react";

// Typings
import { StorageStreamerListType } from "../typings/StorageType";
import { Languages } from "./Chart/src/js/Texts";

export interface TableRowsTextValueI18n {
    focus: string,
    disable: string,
    enable: string
};

export type TableRowsProps = {
    actionsLabels: TableRowsTextValueI18n
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
        regex.test(part) ? <span key={index} className="bg-yellow-300 text-gray-900">{part}</span> : part
    );
};

const scrollToAnchor = () => {
    let anchor = document.querySelector("#accordionExtension");
    if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

const TableRows: FC<TableRowsProps> = ({ actionsLabels, streamersList, currentPage = 1, searchTextValue = '' }: TableRowsProps) => {

    const currentItems = streamersList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const onClickDisableHanlder = (tabId: StorageStreamerListType['tabId'], isEnable: StorageStreamerListType['isEnable']) => {
        chrome.tabs.sendMessage(tabId, { event: isEnable ? "disableChart" : "enableChart" });
    };

    const onClickFocusHandler = async (tabId: StorageStreamerListType['tabId'], windowId: StorageStreamerListType['windowId']) => {
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
    };

    const getPillColor = (status: StorageStreamerListType['status']): string => {
        switch (status) {
            case 'Active': return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
            case 'Actif': return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
            case 'Inactive': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
            case 'Inactif': return 'bg-gradient-to-r from-red-400 via-red-500 to-red-600';
            case 'Idle': return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
            case 'Pause': return 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';
            default: return 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';
        }
    };

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
                            <td className={`${ shouldApplyRoundedClass && 'rounded-bl-lg' } w-3/10 bg-gray-900 flex flex-row pl-2 pr-1 py-4 font-medium text-white/90 group-hover:text-white whitespace-nowrap`}>
                                <img className="mr-2 rounded-full" src={ streamerImage } alt="Streamer avatar" width={ 20 } height={ 20 }/>
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px] cursor-default" title={ streamerName }>
                                 { highlightMatch(displayedName, searchTextValue) }
                                </div>
                            </td>
                            <td className="w-1/10 bg-gray-900 pl-1 pr-1 py-3">
                                <div title={ status } className={`${ getPillColor(status) } mr-1 ml-2 sm:ml-0 w-2 h-2 rounded-full inline-block`}></div>
                                <div className="hidden sm:inline-block group-hover:text-white cursor-default">{ status }</div>
                            </td>
                            <td className="w-3/10 bg-gray-900 py-3">
                                <div className="max-w-[6rem] sm:max-w-[19rem] md:max-w-[24rem] overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-white cursor-default" title={ streamerGame }>
                                 { highlightMatch(streamerGame, searchTextValue) }
                                </div>
                            </td>
                            <td className={`${ shouldApplyRoundedClass && 'rounded-br-lg' } w-2/10 bg-gray-900 px-2 py-3 items-center justify-center group/dropdown relative`}>
                                    <button className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100 group-hover:text-white" type="button">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>
                                    <div className="hidden absolute z-10 w-20 top-[-3px] right-[37px] opacity-90 bg-gray-500 border-gray-900 rounded divide-y divide-gray-100 shadow-sm group-hover/dropdown:block">
                                        <ul className=" text-sm text-white">
                                            <li onClick={ () => onClickFocusHandler(tabId, windowId) } className="hover:bg-gray-400 hover:rounded">
                                                <a href="" className="block py-1 px-2">{ actionsLabels.focus }</a>
                                            </li>
                                            <li onClick={ () => onClickDisableHanlder(tabId, isEnable) } className="hover:bg-gray-400 hover:rounded">
                                                <a href="#" className="block py-1 px-2">{ isEnable ? actionsLabels.disable : actionsLabels.enable }</a>
                                            </li>
                                        </ul>
                                    </div>
                            </td>
                        </tr>
                    )
                })
            }
        </>
    );
};

export { TableRows }