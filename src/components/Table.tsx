import { FC } from "react";

// Typing
import { StorageStreamerListType } from "../typings/StorageType";

export type TableProps = {
    streamerList: StorageStreamerListType[]
}


const Table: FC<TableProps> = ({ streamerList }: TableProps) => {

    return(
        <div className="px-2">
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

                    { streamerList?.map(({streamerName, streamerGame, streamerImage, status}: StorageStreamerListType) => (
                        <tr className="border-b border-gray-700 hover:bg-gray-800">
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
                    
                    {/*<tr className="border-b border-gray-700 hover:bg-gray-800">
                        <th scope="row" className="flex flex-row pl-2 pr-1 py-3 font-medium text-white whitespace-nowrap">
                            <img className="w-5 h-5 mr-2 rounded-full" src="https://static-cdn.jtvnw.net/jtv_user_pictures/8d946327-5c1e-4d67-af84-a8d803575ad3-profile_image-70x70.png" alt="Rounded avatar" />
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px]">
                                WankilStudio
                            </div>  
                        </th>
                        <td className="pl-3 pr-1 py-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full inline-block mr-1"></div>
                             Inactive
                        </td>
                        <td className="pl-4 py-3">
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[125px]">
                            League of Legends
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
                    <tr className="border-b border-gray-700 hover:bg-gray-800">
                        <th scope="row" className="flex flex-row pl-2 pr-1 py-3 font-medium text-white whitespace-nowrap">
                            <img className="w-5 h-5 mr-2 rounded-full" src="https://static-cdn.jtvnw.net/jtv_user_pictures/63ff2bed-9e88-483f-bd4e-cc61d4b43e9c-profile_image-70x70.png" alt="Rounded avatar" />
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[120px]">
                                LittleBigWhale
                            </div>
                        </th>
                        <td className="pl-3 pr-1 py-3">
                            <div className="w-2 h-2 bg-amber-400 rounded-full inline-block mr-1"></div>
                             Idle
                        </td>
                        <td className="pl-4 py-3">
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-[125px]">
                            Minecraft
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
                    </tr>*/}
                </tbody>
            </table>
        </div>                 
    );
};

export { Table } 