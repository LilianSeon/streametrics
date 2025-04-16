export type OnClickPlayPauseButtonHandlerBottomNav = (isPlaying: boolean) => void;
export type OnClickExportButtonHandlerBottomNav = (event: MouseEvent) => void;
export type OnClickExportImageButtonHandlerBottomNav = (event: MouseEvent) => void;
export type OnClickHideShowBarButtonHandlerBottomNav = (isDisplay: boolean) => void;
export type OnClickHideShowLineButtonHandlerBottomNav = (isDisplay: boolean) => void;
export type OnClickHideShowXLabelsButtonHandlerBottomNav = (isDisplay: boolean) => void;
export type OnClickClearButtonHandlerBottomNav = () => void;
export type OnChangeImportHandlerBottomNav = (event: Event) => Promise<void>;
export type OnChangeRefreshValueBottomNav= (newRefreshValue: number) => void;

enum TooltipText {
    Play = 'Play',
    Pause = 'Pause',
};

interface IBottomNavigation<E extends Element> {
    bottomNavigation: E;
    isPlaying: boolean;
    refreshValue: number;
};

export default class BottomNavigation implements IBottomNavigation<Element> {
    bottomNavigation: Element;
    clearButtonContainer: HTMLElement | null;
    downloadButtonContainer: HTMLElement | null;
    exportButtonContainer: HTMLElement | null;
    exportImageButtonContainer: HTMLElement | null;
    importButtonContainer: HTMLElement | null;
    importInput: HTMLInputElement | null;
    idsMenuDisplay: string[];
    playPauseButtonContainer: HTMLElement | null;
    hideShowButtonContainer: HTMLElement | null;
    hideShowCheckboxLine: HTMLInputElement | null;
    hideShowCheckboxBar: HTMLInputElement | null;
    hideShowCheckboxXLabels: HTMLInputElement | null;
    playPauseButtonTooltip: HTMLElement | null;
    progressBar: HTMLElement | null;
    sliderContainer: HTMLElement | null;
    sliderTooltipContainer: HTMLElement | null;
    speedButtonContainer: HTMLElement | null;
    thumb: HTMLElement | null;
    tooltipSlider: HTMLElement | null;
    #i18nTexts: Record<string, string>;
    #isDraggingSlider: boolean = false;
    #isDisplayBar: boolean = true;
    #isDisplayLine: boolean = true;
    #isDisplayXLabels: boolean = false;
    #isPlaying: boolean = true;
    #onChangeRefreshValue: OnChangeRefreshValueBottomNav;
    #sliderValueMax: number = 30;
    #sliderValueMin: number = 1;
    #refreshValue: number;
    private onClickExportButtonHandler: OnClickExportButtonHandlerBottomNav;
    private onClickExportImageButtonHandler: OnClickExportImageButtonHandlerBottomNav;
    private onChangeImportHandler: OnChangeImportHandlerBottomNav;
    private onClickHideShowBarButtonHandler: OnClickHideShowBarButtonHandlerBottomNav;
    private onClickHideShowLineButtonHandler: OnClickHideShowLineButtonHandlerBottomNav;
    private onClickHideShowXLabelsButtonHandler: OnClickHideShowXLabelsButtonHandlerBottomNav;
    private onClickClearButtonHandler: OnClickClearButtonHandlerBottomNav;
    private onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandlerBottomNav;

    constructor(element: Element, refreshValue: number, i18nTexts: Record<string, string>, onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandlerBottomNav, onClickHideShowBarButtonHandler: OnClickHideShowBarButtonHandlerBottomNav, onClickHideShowLineButtonHandler: OnClickHideShowLineButtonHandlerBottomNav, onClickHideShowXLabelsButtonHandlerBottomNav: OnClickHideShowXLabelsButtonHandlerBottomNav, onClickClearButtonHandler: OnClickClearButtonHandlerBottomNav, onChangeImportHandler: OnChangeImportHandlerBottomNav, onClickExportButtonHandler: OnClickExportButtonHandlerBottomNav, onClickExportImageButtonHandler: OnClickExportImageButtonHandlerBottomNav, onChangeRefreshValue: OnChangeRefreshValueBottomNav) {

        const htmlString = `
        <div class="group/outer absolute z-50 w-full max-w-lg -translate-x-1/2 left-1/2 -bottom-[58px] hover:-bottom-[7px] transition-all duration-200 border-8 border-solid border-transparent borderBottomNav">
            <div id="bottomNavigation" class="h-20 bg-zinc-300 dark:bg-gray-700 rounded-full border-8">
                <span class="absolute w-8 h-1 -translate-x-1/2 bg-gray-500 rounded-lg top-[2px] left-1/2 dark:bg-gray-400 opacity-100 transition-opacity group-hover/outer:opacity-0 duration-200"></span>
                <div class="grid h-full max-w-lg grid-cols-5 mx-auto">

                    <button id="hideShowButton" type="button" class="inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-zinc-200 dark:hover:bg-gray-800 group">
                        <svg class="w-8 h-8 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clip-rule="evenodd" />
                            <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                        </svg>
                    </button>
                    <div id="tooltip-hideShowButton" class="absolute transition-opacity duration-400 opacity-0 invisible z-10 w-32 top-[-10rem] font-medium bg-zinc-300 rounded-lg shadow dark:bg-gray-700 hover:visible hover:opacity-95">
                        <ul class="p-2 text-lg text-gray-700 dark:text-gray-200">
                            <li>
                                <div class="flex items-center p-2 rounded hover:bg-zinc-200 dark:hover:bg-gray-600">
                                    <input id="hideShowCheckboxBar" type="checkbox" value="${this.#isDisplayBar}" checked="${this.#isDisplayBar}" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 cursor-pointer">
                                    <label for="hideShowCheckboxBar" i18n-content="bars" class="w-full ms-7 text-xl font-medium text-gray-900 rounded dark:text-gray-300 select-none cursor-pointer"></label>
                                </div>
                            </li>
                            <li>
                                <div class="flex items-center p-2 rounded hover:bg-zinc-200 dark:hover:bg-gray-600">
                                    <input id="hideShowCheckboxLine" type="checkbox" value="${this.#isDisplayLine}" checked="${this.#isDisplayLine}" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 cursor-pointer">
                                    <label for="hideShowCheckboxLine" i18n-content="line" class="w-full ms-7 text-xl font-medium text-gray-900 rounded dark:text-gray-300 select-none cursor-pointer"></label>
                                </div>
                            </li>
                            <li>
                                <div class="flex items-center p-2 rounded hover:bg-zinc-200 dark:hover:bg-gray-600">
                                    <input id="hideShowXLabels" type="checkbox" value="${this.#isDisplayXLabels}" unchecked class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 cursor-pointer">
                                    <label for="hideShowXLabels" i18n-content="axis_x" class="w-full ms-7 text-xl font-medium text-gray-900 rounded dark:text-gray-300 select-none cursor-pointer"></label>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="flex items-center justify-center">
                        <button id="clearButton" type="button" class="h-full w-full flex items-center justify-center px-5 hover:bg-zinc-200 dark:hover:bg-gray-800 group">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <div id="tooltip-clearButton" i18n-content="clear_data" class="absolute invisible text-xl z-10 inline-block px-3 py-2 -top-14 font-medium text-gray-700 dark:text-white transition-opacity duration-400 bg-zinc-300 rounded-lg shadow-sm opacity-0 dark:bg-gray-700 select-none hover:visible hover:opacity-95">
                           
                        </div>
                    </div>

                    <div class="flex items-center justify-center">
                        <button id="playPauseButton" type="button" class="inline-flex items-center justify-center w-14 h-14 font-medium bg-blue-500 dark:bg-blue-600 rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 group focus:outline-none">
                            <svg id="pauseIcon" class="show w-7 h-7 text-white pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
                            </svg>
                            <svg id="playIcon" class="hide w-7 h-7 text-white pointer-events-none" style="margin-left: 2px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                        </button>
                        <div id="tooltip-playPauseButton" class="absolute invisible text-xl z-10 inline-block px-3 py-2 -top-14 font-medium text-gray-700 dark:text-white transition-opacity duration-400 bg-zinc-300 rounded-lg shadow-sm opacity-0 dark:bg-gray-700 select-none hover:visible hover:opacity-95">
                            ${(this.#isPlaying) ? TooltipText.Pause : TooltipText.Play }
                        </div>
                    </div>
                    <div class="flex items-center justify-center">
                        <button id="speedButton" type="button" class="h-full w-full flex items-center justify-center px-5 hover:bg-zinc-200 dark:hover:bg-gray-800 group">
                            <svg class="w-8 h-8 mb-1 pointer-events-none text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.75 4H19M7.75 4a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 4h2.25m13.5 6H19m-2.25 0a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 10h11.25m-4.5 6H19M7.75 16a2.25 2.25 0 0 1-4.5 0m4.5 0a2.25 2.25 0 0 0-4.5 0M1 16h2.25"/>
                            </svg>
                        </button>
                        <div id="tooltip-speedButton" class="absolute invisible text-lg z-10 opacity-0 inline-block pb-5 pt-4 px-6 -top-[7.9rem] left-44 font-medium dark:text-white transition-opacity duration-400 bg-zinc-300 rounded-lg shadow-sm hover:visible hover:opacity-95 dark:bg-gray-700">
                            <div class="flow-root text-gray-700 dark:text-white select-none">
                                <div i18n-content="refresh_rate" class="float-left">Refresh rate :</div>
                                <div class="float-right">
                                    <span id="refreshRate" class="font-semibold text-xl">${ refreshValue }</span>
                                    <span class="text-sm">/sec</span>
                                </div>
                            </div>
                            <div class="flex w-64 m-auto items-center h-12 justify-center">
                                    <div class="py-1 relative min-w-full">
                                        <div id="slider" class="relative w-full h-1.5 bg-white dark:bg-gray-300 rounded cursor-pointer group">
                                            <div id="progressBar" class="absolute h-full bg-blue-600 rounded group-hover:bg-blue-700" style="width: 50%;"></div>
                                            <div id="thumb" class="absolute top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200" style="left: 50%;"></div>
                                            <div id="tooltipSlider" class="absolute hidden -top-2.5 bg-zinc-400 dark:bg-slate-500 text-white px-2 py-1 rounded transform -translate-y-full -translate-x-1/2 shadow-sm select-none">${ refreshValue }</div>
                                        </div>
                                        <div class="relative w-full">
                                            <div class="absolute text-gray-700 dark:text-white -ml-1 bottom-0 left-0 -mb-9 select-none">${ this.#sliderValueMin }s</div>
                                            <div class="absolute text-gray-700 dark:text-white -mr-1 bottom-0 right-0 -mb-9 select-none">${ this.#sliderValueMax }s</div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-center">
                        <button id="downloadButton" type="button" class="h-full w-full flex items-center justify-center px-5 rounded-e-full hover:bg-zinc-200 dark:hover:bg-gray-800 group">
                            <svg class="w-8 h-8 mb-1 pointer-events-none text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                                <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                            </svg>
                        </button>
                        <div id="tooltip-downloadButton" class="absolute z-10 -top-[7.4rem] transition-opacity duration-400 opacity-0 hover:visible hover:opacity-95 bg-zinc-300 divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                            <ul class="py-2 text-xl font-medium text-gray-700 dark:text-gray-200">
                                <li class="relative group">
                                <button id="downloadDropdownButton" type="button" class="flex items-center justify-between w-full px-4 py-2 hover:bg-zinc-200 dark:hover:bg-gray-600 dark:hover:text-white select-none">
                                    <span i18n-content="download"></span>
                                    <svg class="w-2.5 h-2.5 ms-3 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                                    </svg>
                                </button>

                                <!-- Tooltip -->
                                <div id="tooltip-downloadDropdownButton" class="absolute z-10 left-[11.5rem] top-0 mt-[-5px] bg-zinc-300 divide-y divide-zinc-400 dark:divide-gray-600 rounded-lg shadow w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 dark:bg-gray-700 pointer-events-auto">
                                    <ul class="py-2 text-xl font-medium divide-y divide-gray-100 text-gray-700 dark:divide-gray-600 dark:text-gray-200 select-none">
                                        <li>
                                            <button id="exportButton" type="button" class="flex items-center w-full px-4 py-2 hover:bg-zinc-200 dark:hover:bg-gray-600 dark:hover:text-white">
                                                <svg class="w-6 h-6 mr-3 fill-gray-700 dark:fill-gray-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                    <path d="M6,6A2,2,0,0,1,8,4,1,1,0,0,0,8,2,4,4,0,0,0,4,6V9a2,2,0,0,1-2,2,1,1,0,0,0,0,2,2,2,0,0,1,2,2v3a4,4,0,0,0,4,4,1,1,0,0,0,0-2,2,2,0,0,1-2-2V15a4,4,0,0,0-1.38-3A4,4,0,0,0,6,9Zm16,5a2,2,0,0,1-2-2V6a4,4,0,0,0-4-4,1,1,0,0,0,0,2,2,2,0,0,1,2,2V9a4,4,0,0,0,1.38,3A4,4,0,0,0,18,15v3a2,2,0,0,1-2,2,1,1,0,0,0,0,2,4,4,0,0,0,4-4V15a2,2,0,0,1,2-2,1,1,0,0,0,0-2Z"/>
                                                </svg>
                                                <span i18n-content="data"></span>
                                            </button>
                                        </li>
                                        <li class="border-solid border-t border-gray-200">
                                            <button id="exportImageButton" type="button" class="dark:border-gray-700 flex items-center w-full px-4 py-2 hover:bg-zinc-200 dark:hover:bg-gray-600 dark:hover:text-white">
                                                <svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0L9.354 9.646a.5.5 0 0 1-.708 0L6.354 7.354a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0-.146.353V12a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V9.707ZM12 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clip-rule="evenodd" />
                                                </svg>
                                                <span i18n-content="image"></span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                                <li>
                                    <input type="file" id="importInput" accept="application/json" hidden />
                                    <button id="importButton" i18n-content="import_data" type="button" class="flex items-center justify-between w-full px-4 py-2 hover:bg-zinc-200 dark:hover:bg-gray-600 dark:hover:text-white select-none">
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        element.insertAdjacentHTML('beforeend', htmlString);

        // NLS
        this.#i18nTexts = i18nTexts;

        this.bottomNavigation = document.getElementById('bottomNavigation') as Element;

        this.idsMenuDisplay = [];

        // Set playPauseButton callback
        this.playPauseButtonContainer = document.getElementById('playPauseButton');
        this.playPauseButtonTooltip = document.getElementById('tooltip-playPauseButton');
        this.playPauseButtonContainer?.addEventListener('click', this.onClickPlayPauseButtonHandlerFunction.bind(this));
        this.playPauseButtonContainer?.addEventListener('mousemove', this.onMouseoverPlayPauseButtonHandlerFunction.bind(this));
        this.playPauseButtonContainer?.addEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));
        this.onClickPlayPauseButtonHandler = onClickPlayPauseButtonHandler;
        
        // Set hideShowButton callback
        this.hideShowButtonContainer = document.getElementById('hideShowButton');
        this.hideShowButtonContainer?.addEventListener('mouseover', this.onMouseoverPlayPauseButtonHandlerFunction.bind(this));
        this.hideShowButtonContainer?.addEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));
        this.hideShowCheckboxLine = document.getElementById('hideShowCheckboxLine') as HTMLInputElement;
        this.hideShowCheckboxLine?.addEventListener('change', this.onClickHideShowLineButtonHandlerFunction.bind(this));
        this.onClickHideShowLineButtonHandler = onClickHideShowLineButtonHandler;
        this.hideShowCheckboxBar = document.getElementById('hideShowCheckboxBar') as HTMLInputElement;
        this.hideShowCheckboxBar?.addEventListener('change', this.onClickHideShowBarButtonHandlerFunction.bind(this));
        this.onClickHideShowBarButtonHandler = onClickHideShowBarButtonHandler;
        this.hideShowCheckboxXLabels = document.getElementById('hideShowXLabels') as HTMLInputElement;
        this.hideShowCheckboxXLabels?.addEventListener('change', this.onClickHideShowXLabelsButtonHandlerBottomNavFunction.bind(this));
        this.onClickHideShowXLabelsButtonHandler = onClickHideShowXLabelsButtonHandlerBottomNav;

        // Set clearButton callback
        this.clearButtonContainer = document.getElementById('clearButton');
        this.onClickClearButtonHandler = onClickClearButtonHandler;
        this.clearButtonContainer?.addEventListener('click', this.onClickClearButtonHandler);
        this.clearButtonContainer?.addEventListener('mouseover', this.onMouseoverPlayPauseButtonHandlerFunction.bind(this));
        this.clearButtonContainer?.addEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));

        // Set downloadButton callback
        this.downloadButtonContainer = document.getElementById('downloadButton');
        this.downloadButtonContainer?.addEventListener('mouseover', this.onMouseoverPlayPauseButtonHandlerFunction.bind(this));
        this.downloadButtonContainer?.addEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));

        // Set importData callback
        this.importButtonContainer = document.getElementById('importButton');
        this.importButtonContainer?.addEventListener('click', this.#onClickImportButtonHandler);
        this.onChangeImportHandler = onChangeImportHandler;
        this.importInput = document.getElementById('importInput') as HTMLInputElement;
        this.importInput?.addEventListener('change', this.onChangeImportHandler);

        // Set exportButton callback
        this.exportButtonContainer = document.getElementById('exportButton');
        this.onClickExportButtonHandler = onClickExportButtonHandler;
        this.exportButtonContainer?.addEventListener('click', this.onClickExportButtonHandler);

        // Set exportImageButton callback
        this.exportImageButtonContainer = document.getElementById('exportImageButton');
        this.onClickExportImageButtonHandler = onClickExportImageButtonHandler;
        this.exportImageButtonContainer?.addEventListener('click', this.onClickExportImageButtonHandler);

        // Set speedButton callback
        this.speedButtonContainer = document.getElementById('speedButton');
        this.speedButtonContainer?.addEventListener('mouseover', this.onMouseoverSpeedButtonHandlerFunction.bind(this));
        this.speedButtonContainer?.addEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));

        // Set slider callback
        this.#refreshValue = refreshValue;
        this.sliderContainer = document.getElementById('slider');
        this.sliderTooltipContainer = document.getElementById('tooltip-speedButton');
        this.sliderTooltipContainer?.addEventListener('mousedown', this.onMousedownSliderHandlerFunction.bind(this));
        this.sliderTooltipContainer?.addEventListener('mouseup', this.stopDragging.bind(this), false);
        this.sliderTooltipContainer?.addEventListener('mousemove', this.onMousemoveSliderHandlerFunction.bind(this));
        this.sliderTooltipContainer?.addEventListener('mouseleave', this.stopDragging.bind(this), false);
        this.thumb = document.getElementById('thumb');
        this.progressBar = document.getElementById('progressBar');
        this.tooltipSlider = document.getElementById('tooltipSlider');
        this.updateSlicer(this.#refreshValue, this.sliderContainer!.getBoundingClientRect());
        this.#onChangeRefreshValue = onChangeRefreshValue;
    };

    /**
     * Change svg icon play / pause and update tooltip.
     * @param { boolean } newValue
     */
    set isPlaying(newValue: boolean) {
        this.#isPlaying = newValue;
        const pauseIcon = document.getElementById('pauseIcon');
        const playIcon = document.getElementById('playIcon');
        const check = pauseIcon && playIcon && this.playPauseButtonContainer;

        if (newValue && check && this.playPauseButtonTooltip) {

            pauseIcon.classList.add('show');
            pauseIcon.classList.remove('hide');
            playIcon.classList.add('hide');
            playIcon.classList.remove('show');
            this.playPauseButtonTooltip.innerText = TooltipText.Pause;

        } if (!newValue && check && this.playPauseButtonTooltip) {
            pauseIcon.classList.add('hide');
            pauseIcon.classList.remove('show');
            playIcon.classList.add('show');
            playIcon.classList.remove('hide');
            this.playPauseButtonTooltip.innerText = TooltipText.Play;
        }
    };

    get isPlaying(): boolean {
        return this.#isPlaying;
    };

    set isDisplayXLabels(newValue: boolean) {
        this.#isDisplayXLabels = newValue;
    };

    get isDisplayXLabels() {
        return this.#isDisplayXLabels;
    };

    set isDisplayLine(newValue: boolean) {
        this.#isDisplayLine = newValue;
    };

    set isDisplayBar(newValue: boolean) {
        this.#isDisplayBar = newValue;
    };

    get isDisplayBar(): boolean {
        return this.#isDisplayBar;
    };

    set refreshValue(newValue: number) {
        document.getElementById('refreshRate')!.innerText = newValue.toString();
        this.#refreshValue = newValue;
    };

    get refreshValue(): number {
        return this.#refreshValue;
    };

    setI18nTexts(newValue: Record<string, string>) {
        this.#i18nTexts = newValue;
        this.setI18nTextsInDOM();
    };

    getMessageNLS(key: string) {
        return this.#i18nTexts[key];
    };

    setI18nTextsInDOM() {
        document.querySelectorAll('[i18n-content]').forEach(el => {
            const messageName = el.getAttribute('i18n-content');
            if(messageName) el.textContent = this.getMessageNLS(messageName);
        });
    };

    /**
     * Initiates the dragging process for the slider.
     * @param { MouseEvent } event - The mouse event that triggered the dragging.
     */
    onMousedownSliderHandlerFunction(event: MouseEvent): void {
        if ((<HTMLElement>event?.target)?.id && ((<HTMLElement>event.target).id === "slider" || (<HTMLElement>event.target).id === "progressBar" || (<HTMLElement>event.target).id === "thumb")) {
            this.#isDraggingSlider = true;
            if (this.sliderContainer && this.sliderTooltipContainer) {
                const rect = this.sliderContainer.getBoundingClientRect();
                this.updateSlicerAndTooltip(this.getSliderValue(event, rect), rect);
            }
        }
    };

    /**
     * Dragging process for the slider.
     * @param { MouseEvent } event - The mouse event that triggered the dragging.
     */
    onMousemoveSliderHandlerFunction(event: MouseEvent): void {
        if (this.#isDraggingSlider && this.sliderContainer) {
            const rect = this.sliderContainer.getBoundingClientRect();
            this.updateSlicerAndTooltip(this.getSliderValue(event, rect), rect);
        }
        
    };

    /**
     * Updates the slider components based on the current value.
     * @param { number } value - The current value of the slider (sliderValueMin-sliderValueMax).
     * @param { DOMRect } rect - The bounding rectangle of the slider element.
     */
    updateSlicer(value: number, rect: DOMRect): void {
        const position = this.#getSliderPosition(value, rect);

        if (this.thumb && this.progressBar && this.tooltipSlider) {
            this.thumb.style.left = `${position - this.thumb.getBoundingClientRect().width / 2 }px`;
            this.progressBar.style.width = `${position}px`;
        }
    };

    /**
     * Updates the tooltip and slider components based on the current value.
     * @param { number } value - The current value of the slider (sliderValueMin-sliderValueMax).
     * @param { DOMRect } rect - The bounding rectangle of the slider element.
     */
    updateSlicerAndTooltip(value: number, rect: DOMRect): void {
        const position = this.#getSliderPosition(value, rect);
        this.updateSlicer(value, rect);

        if (this.thumb && this.progressBar && this.tooltipSlider) {
            this.tooltipSlider.style.left = `${position}px`;
            this.tooltipSlider.textContent = value.toString();
            this.tooltipSlider.classList.remove('hidden');
        }
    };

    /**
     * Returns slider X position.
     * @param value 
     * @param rect 
     * @returns 
     */
    #getSliderPosition(value: number, rect: DOMRect): number {
        const sliderWidth = rect.width;
        const position = (value / this.#sliderValueMax) * sliderWidth;

        return position;
    };

    /**
     * Calculates the slider value based on the mouse position.
     * @param { MouseEvent } event - The mouse event object.
     * @param { DOMRect } rect - The bounding rectangle of the slider element.
     * @returns { number } - The calculated slider value (3-180).
     */
    getSliderValue(event: MouseEvent, rect: DOMRect): number {
        const offsetX = event.clientX - rect.left;
        const value = Math.max(this.#sliderValueMin, Math.min(this.#sliderValueMax, (offsetX / rect.width) * this.#sliderValueMax));
        
        return Math.round(value);
    };

    /**
     * Stops the dragging process and hides the tooltip.
     */
    stopDragging(event: MouseEvent): void {
        if (this.#isDraggingSlider) {
            const rect = this.sliderContainer!.getBoundingClientRect();
            this.#isDraggingSlider = false;
            this.refreshValue = this.getSliderValue(event, rect);
            this.#onChangeRefreshValue(this.#refreshValue);
            if (this.tooltipSlider) {
                this.tooltipSlider.classList.add('hidden');
            }
        }
    };

    /**
     * Click on #importInput to trigger file explore dialog.
     */
    #onClickImportButtonHandler(): void {
        document.getElementById('importInput')?.click();
    };

    onClickHideShowXLabelsButtonHandlerBottomNavFunction(): void {
        this.onClickHideShowXLabelsButtonHandler(this.#isDisplayXLabels);
    };

    onClickHideShowLineButtonHandlerFunction(): void {
        this.onClickHideShowLineButtonHandler(this.#isDisplayLine);
    };

    onClickHideShowBarButtonHandlerFunction(): void {
        this.onClickHideShowBarButtonHandler(this.#isDisplayBar);
    };

    onMouseoverSpeedButtonHandlerFunction(event: Event): void {
        let id = (<Element>event?.target).id
        if(id) {
            this.#showTooltip(id);
        }
    };

    onMouseoverPlayPauseButtonHandlerFunction(event: Event): void {
        let id = (<Element>event?.target).id
        if(id) {
            this.#showTooltip(id);
        }
    };

    onMouseoverDownloadDropdownButtonHandlerFunction(event: Event): void {
        let id = (<Element>event?.target).id
        if(id) {
            this.#showTooltip(id);
        }
    };

    onMouseoutPlayPauseButtonHandlerFunction(event: Event): void {
        let id = (<Element>event?.target).id
        if(id) {
            this.#hideTooltip(id, 300);
        }
    };

    onClickPlayPauseButtonHandlerFunction(): void {
        this.onClickPlayPauseButtonHandler(this.isPlaying);
    };

    /**
     * 
     * @param { string } id Partial button id
     * @param { number } left
     */
    #showTooltip(id: string) {
        const element = document.getElementById('tooltip-' + id);
        const button = document.getElementById(id);
        
        if (element && button) {
            if (!this.idsMenuDisplay.includes(id)) this.idsMenuDisplay.push(id);
            //element.style.left = left ? (button.offsetLeft - 5 + left).toString()+'px' : button.offsetLeft - 5 + 'px';
            element.classList.remove('invisible', 'opacity-0');
            element.classList.add ('visible', 'opacity-95'); 
        }
    };

    /**
     * 
     * @param { string } id Partial button id
     */
    #hideTooltip(id: string, delay?: number) {
        const element = document.getElementById('tooltip-' + id);
        this.idsMenuDisplay = this.idsMenuDisplay.filter(idMenu => idMenu !== id);

        const hide = () => {
            if (element) {
                element.classList.add('invisible', 'opacity-0');
                element.classList.remove ('visible', 'opacity-95');
            }
        }

        if (delay) {
            setTimeout(() => {
                if (!this.idsMenuDisplay.includes(id)) hide();
            }, delay);
        } else {
            hide();
        }
    };

    /**
     * Remove bottomNavigation from DOM
     */
    destroy(): void {
        this.bottomNavigation.remove();
        this.playPauseButtonContainer?.removeEventListener('click', this.onClickPlayPauseButtonHandlerFunction.bind(this));
        this.playPauseButtonContainer?.removeEventListener('mouseover', this.onMouseoverPlayPauseButtonHandlerFunction.bind(this));
        this.playPauseButtonContainer?.removeEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));
        this.clearButtonContainer?.removeEventListener('click', this.onClickClearButtonHandler);
        this.clearButtonContainer?.removeEventListener('mouseover', this.onMouseoverPlayPauseButtonHandlerFunction.bind(this));
        this.clearButtonContainer?.removeEventListener('mouseout', this.onMouseoutPlayPauseButtonHandlerFunction.bind(this));
        this.importButtonContainer?.removeEventListener('click', this.#onClickImportButtonHandler);
        this.importInput?.removeEventListener('change', this.onChangeImportHandler);
        this.exportButtonContainer?.removeEventListener('click', this.onClickExportButtonHandler);
        this.exportImageButtonContainer?.removeEventListener('click', this.onClickExportImageButtonHandler);
        this.sliderTooltipContainer?.removeEventListener('mousedown', this.onMousedownSliderHandlerFunction.bind(this));
        this.sliderTooltipContainer?.removeEventListener('mouseup', this.stopDragging.bind(this), false);
        this.sliderTooltipContainer?.removeEventListener('mousemove', this.onMousemoveSliderHandlerFunction.bind(this));
        this.sliderTooltipContainer?.removeEventListener('mouseleave', this.stopDragging.bind(this), false);
    };
};
