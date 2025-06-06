import { FC, useMemo, useState } from "react";

// Typing
import { StorageStreamerListType } from "../typings/StorageType";
import { Pagination } from "./Pagination";
import { TableRows } from "./TableRows";
import { NotDetected } from "./NotDetected";
import { Languages } from "./Chart/src/js/Texts";
import { NotFound } from "./NotFound";
import { useAppSelector } from "../store/hooks";
import { RootState } from "../store/store";


export type TableProps = {
    streamersList: StorageStreamerListType[],
    language?: Languages
};

const Table: FC<TableProps> = ({ streamersList }: TableProps) => {

    const translatedText = useAppSelector((state: RootState) => state.translatedText.value);
    const streamerList = useAppSelector((state: RootState) => state.streamerList.value);

    const [ currentPage, setCurrentPage ] = useState(1);
    const [ searchTextValue, setSearchTextValue ] = useState('');

    const filteredStreamers = useMemo(() => streamersList.filter(({ streamerName, streamerGame }) =>
        streamerName.toLowerCase().includes(searchTextValue.toLowerCase()) ||
        streamerGame.toLowerCase().includes(searchTextValue.toLowerCase())
    ), [streamersList, searchTextValue]);

    const filteredStreamersLength = useMemo(() => filteredStreamers.length, [filteredStreamers]);
    const searchTextValueLength = useMemo(() => searchTextValue.length, [searchTextValue]);

    const displayNotFoundOrNotDetected = (filteredStreamersLength: number, searchTextValueLength: number) => {
        if (filteredStreamersLength === 0 && searchTextValueLength === 0) {
            return (<NotDetected />);
        } else if (filteredStreamersLength === 0 && searchTextValueLength !== 0) {
            return (<NotFound searchValue={ searchTextValue } />);
        }
    };

    return(
        <div className="h-auto mx-2 p-2 bg-gray-800 rounded-lg">
            <div className="flex flex-row items-center mb-2">
                <div className="flex flex-col">
                    <form className="flex items-center mb-0">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <input value={ searchTextValue } placeholder={ translatedText?.search_placeholder?.message } onChange={ e => setSearchTextValue(e.target.value) } type="text" className="border text-sm rounded-lg block w-44 pl-10 p-2 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    </form>
                </div>
                <div className="grow"></div>
                { streamerList.length > 3 ? <Pagination totalItems={ filteredStreamersLength } currentPage={ currentPage } setCurrentPage={ setCurrentPage } /> : <></> }
            </div>
            <div className="rounded-lg overflow-visible">
                <table className="rounded-lg w-full text-sm text-left text-gray-400 table-auto overflow-visible">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                        <tr>
                            <th className="rounded-tl-lg px-4 py-3">Streamer</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 pl-1">{ translatedText?.game?.message }</th>
                            <th className="rounded-tr-lg py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        { filteredStreamersLength !== 0 && <TableRows streamersList={filteredStreamers} currentPage={currentPage} searchTextValue={searchTextValue} />}
                    </tbody>
                </table>
                { displayNotFoundOrNotDetected(filteredStreamersLength, searchTextValueLength) }
            </div>
            
        </div>
                  
    );
};

export { Table } 