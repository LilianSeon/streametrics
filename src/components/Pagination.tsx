import { FC } from "react";

export type PaginationProps = {
    totalItems: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage?: number;
    currentPage?: number;
};

const Pagination: FC<PaginationProps> = ({ totalItems, itemsPerPage = 3, currentPage = 1, setCurrentPage}: PaginationProps) => {

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return(
        <div className="flex flex-col items-center justify-end align-middle">
            <nav className="flex flex-col justify-between items-end space-y-3" aria-label="Table navigation">
                <ul className="inline-flex items-stretch -space-x-px">
                    <li onClick={ goToPreviousPage } title="Previous page">
                        <a href="#" className="flex items-center justify-center h-full py-1.5 px-3 ml-0 rounded-l-lg border bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">
                            <span className="sr-only">Previous</span>
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="#" className="flex items-center justify-center text-sm py-2 px-2 leading-tight bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">
                            <span className="mr-1 font-semibold text-white">{ totalItems === 0 ? '0' : currentPage }</span>
                            of
                            <span className="ml-1 font-semibold text-white">{ totalPages }</span>
                        </a>
                    </li>
                    <li onClick={ goToNextPage } title="Next page">
                        <a href="#" className="flex items-center justify-center h-full py-1.5 px-3 leading-tight rounded-r-lg border bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">
                            <span className="sr-only">Next</span>
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export { Pagination }