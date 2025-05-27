import { FC, useEffect, useMemo, useState } from "react";

// Typing
import { StorageStreamerListType } from "../typings/StorageType";
import { Pagination } from "./Pagination";
import { TableRows, TableRowsTextValueI18n } from "./TableRows";
import { NotDetected, NotDetectedTextValueI18n } from "./NotDetected";
import { Languages } from "./Chart/src/js/Texts";
import { loadMessages } from "../loader/fileLoader";
import { NotFound, NotFoundTextValueI18n } from "./NotFound";

interface TableTextValueI18n extends TableRowsTextValueI18n, NotDetectedTextValueI18n, NotFoundTextValueI18n {
    search_placeholder: string,
    previous_page: string
    next_page: string,
    pagination_of: string,
    game: string,
}

export type TableProps = {
    streamersList: StorageStreamerListType[],
    language?: Languages
};

const i18nKeys = ["not_found_message", "not_found_advise", "search_placeholder", "previous_page", "next_page", "focus", "disable", "enable", "not_detected_button", "not_detected_message", "pagination_of", "game"];

const Table: FC<TableProps> = ({ streamersList, language }: TableProps) => {

    const [ currentPage, setCurrentPage ] = useState(1);
    const [ searchTextValue, setSearchTextValue ] = useState('');
    const [ textValue, setTextValue ] = useState<TableTextValueI18n>({ not_found_message: '', not_found_advise: '', game: '', pagination_of: '', search_placeholder: '', previous_page: '', next_page: '', focus: '', disable: '', enable: '', not_detected_message: '', not_detected_button: '' });


    const filteredStreamers = useMemo(() => streamersList.filter(({ streamerName, streamerGame }) =>
        streamerName.toLowerCase().includes(searchTextValue.toLowerCase()) ||
        streamerGame.toLowerCase().includes(searchTextValue.toLowerCase())
    ), [streamersList, searchTextValue]);

    const filteredStreamersLength = useMemo(() => filteredStreamers.length, [filteredStreamers]);
    const searchTextValueLength = useMemo(() => searchTextValue.length, [searchTextValue]);

    const displayNotFoundOrNotDetected = (filteredStreamersLength: number, searchTextValueLength: number) => {
        if (filteredStreamersLength === 0 && searchTextValueLength === 0) {
            return (<NotDetected notFoundTexts={{ not_detected_message: textValue.not_detected_message, not_detected_button: textValue.not_detected_button }} />);
        } else if (filteredStreamersLength === 0 && searchTextValueLength !== 0) {
            return (<NotFound searchValue={ searchTextValue } notFoundTexts={{ not_found_message: textValue.not_found_message, not_found_advise: textValue.not_found_advise }} />);
        }
    };

    useEffect(() => {
        if (language) {
            loadMessages(i18nKeys, language)
            .then((message) => {
                setTextValue((textValue) => { return { ...textValue, ...message }});
            });
        }
    }, [language]);

    return(
        <div className="h-[260px] mx-2 p-2 bg-gray-800 rounded-lg">
            <div className="flex flex-row items-center mb-2">
                <div className="flex flex-col">
                    <form className="flex items-center mb-0">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <input value={ searchTextValue } placeholder={ textValue.search_placeholder } onChange={ e => setSearchTextValue(e.target.value) } type="text" className="border text-sm rounded-lg block w-44 pl-10 p-2 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    </form>
                </div>
                <div className="grow"></div>
                <Pagination totalItems={ filteredStreamersLength } currentPage={ currentPage } setCurrentPage={ setCurrentPage } paginationTexts={{ previous_page: textValue.previous_page, next_page: textValue.next_page, pagination_of: textValue.pagination_of }}/>
            </div>
            <div className="rounded-lg overflow-visible">
                <table className="rounded-lg w-full text-sm text-left text-gray-400 table-auto overflow-visible">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-300">
                        <tr>
                            <th scope="col" className="rounded-tl-lg w-35 px-4 py-3">Streamer</th>
                            <th scope="col" className="w-20 px-4 py-3">Status</th>
                            <th scope="col" className="w-40 pl-4 py-3">{ textValue.game } </th>
                            <th scope="col" className="rounded-tr-lg w-5 pr-2 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        { filteredStreamersLength !== 0 ? <TableRows streamersList={filteredStreamers} currentPage={currentPage} searchTextValue={searchTextValue} actionsLabels={{ focus: textValue.focus, disable: textValue.disable, enable: textValue.enable }} language={ language } /> : <></> }
                    </tbody>
                </table>
                { displayNotFoundOrNotDetected(filteredStreamersLength, searchTextValueLength) }
            </div>
            
        </div>
                  
    );
};

export { Table } 