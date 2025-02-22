import { FC, useState } from "react";

// Typing
import { StorageStreamerListType } from "../typings/StorageType";
import { Pagination } from "./Pagination";

export type TableProps = {
    streamerList: StorageStreamerListType[]
};

const itemsPerPage = 3;

const Table: FC<TableProps> = ({ streamerList }: TableProps) => {

    const [currentPage, setCurrentPage] = useState(1);

    // Fonction pour obtenir les items de la page actuelle
    const currentItems = streamerList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return(
        <div className="h-[246px] mx-2 p-2 bg-gray-800 rounded-lg">
            <div className="flex flex-row items-center mb-2">
                <div className="flex flex-col">
                    <form className="flex items-center mb-0">
                        <label htmlFor="search" className="sr-only">Search</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <input type="text" id="search" className="border text-sm rounded-lg block w-44 pl-10 p-2 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primary-500 focus:border-primary-500" placeholder="Search" />
                        </div>
                    </form>
                </div>
                <div className="grow"></div>
                <Pagination totalItems={ streamerList.length } currentPage={ currentPage } setCurrentPage={ setCurrentPage } />
            </div>
            <div className="rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left text-gray-400 table-auto">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                        <tr>
                            <th scope="col" className="w-35 px-4 py-3">Streamer</th>
                            <th scope="col" className="w-20 px-4 py-3">Status</th>
                            <th scope="col" className="w-40 pl-4 py-3">Game</th>
                            <th scope="col" className="w-5 pr-2 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>

                        { currentItems?.map(({streamerName, streamerGame, streamerImage, status}: StorageStreamerListType, index) => (
                            <tr className={`${index !== streamerList.length-1 ? 'border-b' : ''} border-gray-700 bg-gray-900 hover:bg-gray-600`}>
                                <th scope="row" className="flex flex-row pl-2 pr-1 py-3 font-medium text-white whitespace-nowrap">
                                    <img className="w-5 h-5 mr-2 rounded-full" src={ streamerImage } alt="Streamer avatar" />
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px]" title={ streamerName }>
                                        { streamerName }
                                    </div>
                                </th>
                                <td className="pl-3 pr-1 py-3">
                                    <div className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1"></div>
                                    { status }
                                </td>
                                <td className="pl-4 py-3">
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[125px]" title={ streamerGame }>
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
                        ))}
                    </tbody>
                </table>
            </div>
            
        </div>
                  
    );
};

export { Table } 