// CSS
import '../assets/css/accordion.css';

export type OnClickArrowAccordionHandler = () => void;
export type OnClickExportButtonHandler = (event: MouseEvent) => void;
export type OnClickPlayPauseButtonHandler = (isPlaying: boolean) => void;

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
    exportButtonContainer: HTMLElement | null;
    playPauseButtonContainer: HTMLElement | null;
    tabContent: HTMLElement | null;
    isExpanded: boolean;
    #isPlaying: boolean = true;
    private onClickArrowAccordionHandler: OnClickArrowAccordionHandler;
    private onClickExportButtonHandler: OnClickExportButtonHandler;
    private onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler;

    constructor(element: Element, onClickArrowAccordionHandler: OnClickArrowAccordionHandler, onClickExportButtonHandler: OnClickExportButtonHandler, onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler, isExpanded: boolean) {

        const htmlString = `
            <section id="accordionExtension" class="accordionExtension">
                <style>
                    :root {
                        --arrowTransform: rotate(${ isExpanded ? 270 : 90 }deg);
                    }
                </style>
                <div class="tabExtension">
                    <div class="flex-container bg-primary">

                        <button id="playPauseButton" class="tab__exportButton" title="${ this.#isPlaying ? 'Pause' : 'Play' }">
                            <svg id="pauseIcon" class="${ this.#isPlaying ? 'show' : 'hide' }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6">
                                <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
                            </svg>
                            <svg id="playIcon" class="${ this.#isPlaying ? 'hide' : 'show' }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6">
                                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
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

        this.playPauseButtonContainer = document.getElementById('playPauseButton');
        this.playPauseButtonContainer?.addEventListener('click', this.onClickPlayPauseButtonHandlerFunction.bind(this));
        this.onClickPlayPauseButtonHandler = onClickPlayPauseButtonHandler;

        this.exportButtonContainer = document.getElementById('exportButton');
        this.onClickExportButtonHandler = onClickExportButtonHandler;
        this.exportButtonContainer?.addEventListener('click', this.onClickExportButtonHandler);

        this.arrowAccordion = document.getElementById('arrowAccordion');
        this.arrowAccordion?.addEventListener('click', onClickArrowAccordionHandler);
        this.accordion = document.getElementById('accordionExtension') as Element;
        this.chartContainer = document.getElementById('chartContainer');
        this.tabContent = document.getElementById('tab__content');
        this.isExpanded = isExpanded || true;
        this.onClickArrowAccordionHandler = onClickArrowAccordionHandler;

        isExpanded ? this.expandChartContainer() : this.collapseChartContainer();
    };

    onClickPlayPauseButtonHandlerFunction() {
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
        this.playPauseButtonContainer?.removeEventListener('click', this.onClickPlayPauseButtonHandlerFunction);
    };

};

