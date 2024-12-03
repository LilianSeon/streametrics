// CSS
import '../assets/css/accordion.css';

export type OnClickArrowAccordionHandler = () => void;
export type OnClickClearButtonHandler = () => void;
export type OnClickExportButtonHandler = (event: MouseEvent) => void;
export type OnClickExportImageButtonHandler = (event: MouseEvent) => void;
export type OnClickPlayPauseButtonHandler = (isPlaying: boolean) => void;
export type OnClickHideShowMessageButtonHandler = (isDisplay: boolean) => void;
export type OnClickHideShowViewerButtonHandler = (isDisplay: boolean) => void;
export type OnChangeImportHandler = (event: Event) => Promise<void>;

enum ActiveButtonOutline {
    none = 'none',
    active = 'rgb(30 64 175) solid 3px'
}

interface IAccordion<E extends Element> {
    arrowAccordion: E | null;
    accordion: E;
    isExpanded: boolean;
    isPlaying: boolean;
    isDisplayMessage: boolean;
    toastContainer: HTMLDivElement;
    collapseChartContainer(): void;
    destroy(): void;
    expandChartContainer(): void;
    getAccordionElement(): Element;
    getChartContainer(): Element | null;
}


export default class Accordion implements IAccordion<Element> {
    arrowAccordion: HTMLElement | null;
    accordion: Element;
    chartContainer: HTMLElement | null;
    clearButtonContainer: HTMLElement | null;
    exportButtonContainer: HTMLElement | null;
    exportImageButtonContainer: HTMLElement | null;
    importButtonContainer: HTMLElement | null;
    importInput: HTMLInputElement | null;
    playPauseButtonContainer: HTMLElement | null;
    hideShowMessageButtonContainer: HTMLElement | null;
    hideShowViewerButtonContainer: HTMLElement | null;
    tabContent: HTMLElement | null;
    toastContainer: HTMLDivElement;
    isExpanded: boolean;
    #isPlaying: boolean = true;
    #isDisplayMessage: boolean = true;
    #isDisplayViewer: boolean = true;
    private onChangeImportHandler: OnChangeImportHandler;
    private onClickArrowAccordionHandler: OnClickArrowAccordionHandler;
    private onClickClearButtonHandler: OnClickClearButtonHandler;
    private onClickExportButtonHandler: OnClickExportButtonHandler;
    private onClickExportImageButtonHandler: OnClickExportImageButtonHandler;
    private onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler;
    private onClickHideShowMessageButtonHandler: OnClickHideShowMessageButtonHandler;
    private onClickHideShowViewerButtonHandler: OnClickHideShowViewerButtonHandler;

    constructor(element: Element, onClickArrowAccordionHandler: OnClickArrowAccordionHandler, onClickExportButtonHandler: OnClickExportButtonHandler, onChangeImportHandler: OnChangeImportHandler, onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler, onClickClearButtonHandler: OnClickClearButtonHandler, onClickHideShowMessageButtonHandler: OnClickHideShowMessageButtonHandler, onClickHideShowViewerButtonHandler: OnClickHideShowViewerButtonHandler, onClickExportImageButtonHandler: OnClickExportImageButtonHandler, isExpanded: boolean) {

        const htmlString = `
            <section id="accordionExtension" class="accordionExtension">
                <style>
                    :root {
                        --arrowTransform: rotate(${ isExpanded ? 270 : 90 }deg);
                    }
                </style>
                <div class="tabExtension">
                    <div class="flex-container bg-primary px-2">

                        <button id="exportImageButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="Download chart image">
                            <svg id="exportImageButtonIcon" class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        <button id="hideShowViewerButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="Hide viewer line">
                            <svg id="hideShowViewerIcon" class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 0 1-1.452-.38L5.823 15H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75ZM7.373 15l-.391 1.5h6.037l-.392-1.5H7.373Zm7.49-8.931a.75.75 0 0 1-.175 1.046 19.326 19.326 0 0 0-3.398 3.098.75.75 0 0 1-1.097.04L8.5 8.561l-2.22 2.22A.75.75 0 1 1 5.22 9.72l2.75-2.75a.75.75 0 0 1 1.06 0l1.664 1.663a20.786 20.786 0 0 1 3.122-2.74.75.75 0 0 1 1.046.176Z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        <button id="hideShowMessageButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="Hide message bars">
                            <svg id="hideShowMessageIcon" class="w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M1 2.75A.75.75 0 0 1 1.75 2h16.5a.75.75 0 0 1 0 1.5H18v8.75A2.75 2.75 0 0 1 15.25 15h-1.072l.798 3.06a.75.75 0 0 1-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 0 1-1.452-.38L5.823 15H4.75A2.75 2.75 0 0 1 2 12.25V3.5h-.25A.75.75 0 0 1 1 2.75ZM7.373 15l-.391 1.5h6.037l-.392-1.5H7.373ZM13.25 5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 6.75 9Zm4-1.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        <button id="clearButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="Clear data">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        <button id="playPauseButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="${ this.#isPlaying ? 'Pause' : 'Play' }">
                            <svg id="pauseIcon" class="${ this.#isPlaying ? 'show' : 'hide' } w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
                            </svg>
                            <svg id="playIcon" class="${ this.#isPlaying ? 'hide' : 'show' } w-9 h-9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                        </button>

                        <input type="file" id="importInput" accept="application/json" hidden />
                        <button id="importButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="Import data">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
                                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                            </svg>
                        </button>

                        <button id="exportButton" class="my-auto mx-0.5 text-blue-700 border border-blue-700 hover:bg-slate-700 hover:text-white font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center me-2 dark:text-white dark:hover:text-white dark:hover:bg-slate-700" title="Download data">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                            </svg>
                        </button>

                        <div id="headerLabel" class="tab__label">TwitchChart</div>
                        <div id="arrowAccordion" class="arrowExtension last-item"></div>

                    </div>
                    <div id="tab__content" class="tab__content">
                        <div id="toastContainer" class="relative mt-3 flex flex-col space-y-20 z-50"></div>
                        <p id="chartContainer"></p>
                    </div>
                </div>
            </section>
        `;

        element.insertAdjacentHTML('afterend', htmlString);

        // Set playPauseButton callback
        this.playPauseButtonContainer = document.getElementById('playPauseButton');
        this.playPauseButtonContainer?.addEventListener('click', this.onClickPlayPauseButtonHandlerFunction.bind(this));
        this.onClickPlayPauseButtonHandler = onClickPlayPauseButtonHandler;

        // Set hideShowViewerButton callback
        this.hideShowViewerButtonContainer = document.getElementById('hideShowViewerButton');
        this.hideShowViewerButtonContainer?.addEventListener('click', this.onClickHideShowViewerButtonHandlerFunction.bind(this));
        this.onClickHideShowViewerButtonHandler = onClickHideShowViewerButtonHandler;

        // Set hideShowMessageButton callback
        this.hideShowMessageButtonContainer = document.getElementById('hideShowMessageButton');
        this.hideShowMessageButtonContainer?.addEventListener('click', this.onClickHideShowMessageButtonHandlerFunction.bind(this));
        this.onClickHideShowMessageButtonHandler = onClickHideShowMessageButtonHandler;

        // Set exportButton callback
        this.exportButtonContainer = document.getElementById('exportButton');
        this.onClickExportButtonHandler = onClickExportButtonHandler;
        this.exportButtonContainer?.addEventListener('click', this.onClickExportButtonHandler);

        // Set exportImageButton callback
        this.exportImageButtonContainer = document.getElementById('exportImageButton');
        this.onClickExportImageButtonHandler = onClickExportImageButtonHandler;
        this.exportImageButtonContainer?.addEventListener('click', this.onClickExportImageButtonHandler);

        // Set importData callback
        this.importButtonContainer = document.getElementById('importButton');
        this.importButtonContainer?.addEventListener('click', this.#onClickImportButtonHandler);
        this.onChangeImportHandler = onChangeImportHandler;
        this.importInput = document.getElementById('importInput') as HTMLInputElement;
        this.importInput?.addEventListener('change', this.onChangeImportHandler);

        // Set clearData callback
        this.clearButtonContainer = document.getElementById('clearButton');
        this.onClickClearButtonHandler = onClickClearButtonHandler;
        this.clearButtonContainer?.addEventListener('click', this.onClickClearButtonHandler);

        // Toast
        this.toastContainer = document.getElementById('toastContainer') as HTMLDivElement;

        this.arrowAccordion = document.getElementById('arrowAccordion');
        this.arrowAccordion?.addEventListener('click', onClickArrowAccordionHandler);
        this.accordion = document.getElementById('accordionExtension') as Element;
        this.chartContainer = document.getElementById('chartContainer');
        this.tabContent = document.getElementById('tab__content');
        this.isExpanded = isExpanded || true;
        this.onClickArrowAccordionHandler = onClickArrowAccordionHandler;

        isExpanded ? this.expandChartContainer() : this.collapseChartContainer();
    };

    /**
     * Click on #importInput to trigger file explore dialog
     */
    #onClickImportButtonHandler(): void {
        document.getElementById('importInput')?.click();
    }

    onClickHideShowViewerButtonHandlerFunction(): void {
        this.onClickHideShowViewerButtonHandler(this.#isDisplayViewer);
    };

    onClickHideShowMessageButtonHandlerFunction(): void {
        this.onClickHideShowMessageButtonHandler(this.#isDisplayMessage);
    };

    onClickPlayPauseButtonHandlerFunction(): void {
        this.onClickPlayPauseButtonHandler(this.isPlaying);
    };

    #toggleActiveButtonStyle(element: HTMLElement, action: "remove" | "add") {
        if (action === "remove") {
            element.style.outline = ActiveButtonOutline.none;
        } else if (action === "add") {
            element.style.outline = ActiveButtonOutline.active;
        }
    };
        
    set isDisplayViewer(newValue: boolean) {
        this.#isDisplayViewer = newValue;
        if (this.hideShowViewerButtonContainer) {
            if (newValue) {
                this.#toggleActiveButtonStyle(this.hideShowViewerButtonContainer, 'remove');
                this.hideShowViewerButtonContainer.title = 'Hide viewer line';
            } else {
                this.#toggleActiveButtonStyle(this.hideShowViewerButtonContainer, 'add');
                this.hideShowViewerButtonContainer.title = 'Show viewer line';
            }
        }
    };

    set isDisplayMessage(newValue: boolean) {
        this.#isDisplayMessage = newValue;
        if (this.hideShowMessageButtonContainer) {
            if (newValue) {
                this.#toggleActiveButtonStyle(this.hideShowMessageButtonContainer, 'remove');
                this.hideShowMessageButtonContainer.title = 'Hide message bars';
            } else {
                this.#toggleActiveButtonStyle(this.hideShowMessageButtonContainer, 'add');
                this.hideShowMessageButtonContainer.title = 'Show message bars';
            }
        }
        
        /*const hideMessageIcon = document.getElementById('hideMessageIcon');
        const showMessageIcon = document.getElementById('showMessageIcon');

        if (newValue && hideMessageIcon && showMessageIcon && this.hideShowMessageButtonContainer) {

            hideMessageIcon.classList.add('show');
            hideMessageIcon.classList.remove('hide');
            showMessageIcon.classList.add('hide');
            showMessageIcon.classList.remove('show');
            this.hideShowMessageButtonContainer.title = 'Hide message bars';

        } if (!newValue && hideMessageIcon && showMessageIcon && this.hideShowMessageButtonContainer) {
            hideMessageIcon.classList.add('hide');
            hideMessageIcon.classList.remove('show');
            showMessageIcon.classList.add('show');
            showMessageIcon.classList.remove('hide');
            this.hideShowMessageButtonContainer.title = 'Show message bars';
        }*/
    };

    /**
     * Change svg icon play / pause and update title
     * @param { boolean } newValue
     */
    set isPlaying(newValue: boolean) {
        this.#isPlaying = newValue;
        const pauseIcon = document.getElementById('pauseIcon');
        const playIcon = document.getElementById('playIcon');

        if (newValue && pauseIcon && playIcon && this.playPauseButtonContainer) {

            pauseIcon.classList.add('show');
            pauseIcon.classList.remove('hide');
            playIcon.classList.add('hide');
            playIcon.classList.remove('show');
            this.playPauseButtonContainer.title = 'Pause';

        } if (!newValue && pauseIcon && playIcon && this.playPauseButtonContainer) {
            pauseIcon.classList.add('hide');
            pauseIcon.classList.remove('show');
            playIcon.classList.add('show');
            playIcon.classList.remove('hide');
            this.playPauseButtonContainer.title = 'Play';
        }
    };

    get isDisplayMessage(): boolean {
        return this.#isDisplayMessage;
    };

    get isPlaying(): boolean {
        return this.#isPlaying;
    };

    getAccordionElement(): Element {
        return this.accordion;
    };

    getChartContainer(): Element | null {
        return this.chartContainer;
    };

    expandChartContainer(): void {
        if (this.tabContent && this.arrowAccordion) {
            this.tabContent.style.maxHeight = '300px';
            this.arrowAccordion.style.setProperty('--arrowTransform', 'rotate(270deg)');
            this.isExpanded = true;
        }
    };

    collapseChartContainer(): void {
        if (this.tabContent && this.arrowAccordion) {
            this.tabContent.style.maxHeight = '0px';
            this.arrowAccordion.style.setProperty('--arrowTransform', 'rotate(90deg)');
            this.isExpanded = false;
        }
    };

    destroy(): void {
        this.accordion.remove();
        this.arrowAccordion?.removeEventListener('click', this.onClickArrowAccordionHandler);
        this.exportButtonContainer?.removeEventListener('click', this.onClickExportButtonHandler);
        this.exportImageButtonContainer?.removeEventListener('click', this.onClickExportImageButtonHandler);
        this.importButtonContainer?.removeEventListener('click', this.#onClickImportButtonHandler);
        this.importInput?.removeEventListener('change', this.onChangeImportHandler); 
        this.playPauseButtonContainer?.removeEventListener('click', this.onClickPlayPauseButtonHandlerFunction);
        this.hideShowMessageButtonContainer?.removeEventListener('click', this.onClickHideShowMessageButtonHandlerFunction);
        this.clearButtonContainer?.removeEventListener('click', this.onClickClearButtonHandler);
    };

};

