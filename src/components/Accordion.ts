// CSS
import '../assets/css/accordion.css';

export type OnClickArrowAccordionHandler = () => void;
export type OnClickClearButtonHandler = () => void;
export type OnClickExportButtonHandler = (event: MouseEvent) => void;
export type OnClickPlayPauseButtonHandler = (isPlaying: boolean) => void;
export type OnChangeImportHandler = (event: Event) => Promise<void>;

interface IAccordion<E extends Element> {
    arrowAccordion: E | null;
    accordion: E;
    isExpanded: boolean;
    isPlaying: boolean;
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
    importButtonContainer: HTMLElement | null;
    importInput: HTMLInputElement | null;
    playPauseButtonContainer: HTMLElement | null;
    tabContent: HTMLElement | null;
    isExpanded: boolean;
    #isPlaying: boolean = true;
    private onChangeImportHandler: OnChangeImportHandler;
    private onClickArrowAccordionHandler: OnClickArrowAccordionHandler;
    private onClickClearButtonHandler: OnClickClearButtonHandler;
    private onClickExportButtonHandler: OnClickExportButtonHandler;
    private onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler;

    constructor(element: Element, onClickArrowAccordionHandler: OnClickArrowAccordionHandler, onClickExportButtonHandler: OnClickExportButtonHandler, onChangeImportHandler: OnChangeImportHandler, onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler, onClickClearButtonHandler: OnClickClearButtonHandler, isExpanded: boolean) {

        const htmlString = `
            <section id="accordionExtension" class="accordionExtension">
                <style>
                    :root {
                        --arrowTransform: rotate(${ isExpanded ? 270 : 90 }deg);
                    }
                </style>
                <div class="tabExtension">
                    <div class="flex-container bg-primary">

                        <button id="clearButton" class="tab__clearButton" title="Clear data">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        <button id="playPauseButton" class="tab__exportButton" title="${ this.#isPlaying ? 'Pause' : 'Play' }">
                            <svg id="pauseIcon" class="${ this.#isPlaying ? 'show' : 'hide' }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
                            </svg>
                            <svg id="playIcon" class="${ this.#isPlaying ? 'hide' : 'show' }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
                            </svg>
                        </button>

                        <input type="file" id="importInput" accept="application/json" hidden />
                        <button id="importButton" class="tab__importButton" title="Import data">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
                                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                            </svg>
                        </button>

                        <button id="exportButton" class="tab__exportButton" title="Download data">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                            </svg>
                        </button>

                        <div id="headerLabel" class="tab__label">TwitchChart</div>
                        <div id="arrowAccordion" class="arrowExtension last-item"></div>

                    </div>
                    <div id="tab__content" class="tab__content">
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

        // Set exportButton callback
        this.exportButtonContainer = document.getElementById('exportButton');
        this.onClickExportButtonHandler = onClickExportButtonHandler;
        this.exportButtonContainer?.addEventListener('click', this.onClickExportButtonHandler);

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

    onClickPlayPauseButtonHandlerFunction(): void {
        this.onClickPlayPauseButtonHandler(this.isPlaying);
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

    get isPlaying(): boolean {
        return this.#isPlaying;
    }

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
        this.importButtonContainer?.removeEventListener('click', this.#onClickImportButtonHandler);
        this.importInput?.removeEventListener('change', this.onChangeImportHandler); 
        this.playPauseButtonContainer?.removeEventListener('click', this.onClickPlayPauseButtonHandlerFunction);
        this.clearButtonContainer?.removeEventListener('click', this.onClickClearButtonHandler);
    };

};

