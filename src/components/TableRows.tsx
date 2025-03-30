import { FC } from "react";
import { StorageStreamerListType } from "../typings/StorageType";

export type TableRowsProps = {
    streamersList: StorageStreamerListType[],
    currentPage?: number
}

const itemsPerPage = 3;

const TableRows: FC<TableRowsProps> = ({ streamersList, currentPage = 1 }: TableRowsProps) => {

    const currentItems = streamersList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return(
        <>
            { 
                currentItems?.map(({ streamerName, streamerGame, streamerImage, status, occurrences }: StorageStreamerListType, index) => {

                    // Handle suffix streamer name : (x)
                    const displayedName = occurrences > 0 ? `${streamerName} (${occurrences})` : `${streamerName}`;

                    return(
                        <tr className={`${index !== streamersList.length-1 ? 'border-b' : ''} border-gray-700 bg-gray-900 hover:bg-gray-600 group`}>
                            <th scope="row" className="flex flex-row pl-2 pr-1 py-3 font-medium text-white whitespace-nowrap">
                                <img className="w-5 h-5 mr-2 rounded-full" src={ streamerImage } alt="Streamer avatar" />
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px]" title={ streamerName }>
                                    { displayedName }
                                </div>
                            </th>
                            <td className="pl-3 pr-1 py-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1 group-hover:text-white"></div>
                                { status }
                            </td>
                            <td className="pl-4 py-3">
                                <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[125px] group-hover:text-white" title={ streamerGame }>
                                { streamerGame }
                                </div>
                            </td>
                            <td className="px-2 py-3 flex items-center justify-center">
                                <button id="apple-imac-27-dropdown-button" data-dropdown-toggle="apple-imac-27-dropdown" className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
                                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </button>
                                <div id="apple-imac-27-dropdown" className="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-imac-27-dropdown-button">
                                        <li>
                                            <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
                                        </li>
                                        <li>
                                            <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
                                        </li>
                                    </ul>
                                    <div className="py-1">
                                        <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
                                    </div>
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