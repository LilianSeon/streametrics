// CSS
import '../assets/css/accordion.css';

// Component
import BottomNavigation, { OnClickPlayPauseButtonHandlerBottomNav, OnClickHideShowBarButtonHandlerBottomNav, OnClickHideShowLineButtonHandlerBottomNav, OnClickClearButtonHandlerBottomNav, OnChangeImportHandlerBottomNav, OnClickExportButtonHandlerBottomNav, OnClickExportImageButtonHandlerBottomNav } from './BottomNavigation';

export type OnClickArrowAccordionHandler = () => void;
export type OnClickClearButtonHandler = OnClickClearButtonHandlerBottomNav;
export type OnClickExportButtonHandler = OnClickExportButtonHandlerBottomNav;
export type OnClickExportImageButtonHandler = OnClickExportImageButtonHandlerBottomNav;
export type OnClickPlayPauseButtonHandler = OnClickPlayPauseButtonHandlerBottomNav;
export type OnClickHideShowMessageButtonHandler = OnClickHideShowBarButtonHandlerBottomNav;
export type OnClickHideShowViewerButtonHandler = OnClickHideShowLineButtonHandlerBottomNav;
export type OnChangeImportHandler = OnChangeImportHandlerBottomNav;

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
    tabContent: HTMLElement | null;
    bottomNavigation: BottomNavigation | undefined;
    toastContainer: HTMLDivElement;
    isExpanded: boolean;
    #isPlaying: boolean = true;
    #isDisplayMessage: boolean = true;
    #isDisplayViewer: boolean = true;
    private onClickArrowAccordionHandler: OnClickArrowAccordionHandler;

    constructor(element: Element, onClickArrowAccordionHandler: OnClickArrowAccordionHandler, onClickExportButtonHandler: OnClickExportButtonHandler, onChangeImportHandler: OnChangeImportHandler, onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler, onClickClearButtonHandler: OnClickClearButtonHandler, onClickHideShowMessageButtonHandler: OnClickHideShowMessageButtonHandler, onClickHideShowViewerButtonHandler: OnClickHideShowViewerButtonHandler, onClickExportImageButtonHandler: OnClickExportImageButtonHandler, isExpanded: boolean) {

        const htmlString = `
            <section id="accordionExtension" class="accordionExtension">
                <style>
                    :root {
                        --arrowTransform: rotate(${ isExpanded ? 270 : 90 }deg);
                    }
                </style>
                <div class="tabExtension">
                    <div class="flex-container bg-primary px-2">>

                        <div id="headerLabel" class="tab__label">TwitchChart</div>
                        <div id="arrowAccordion" class="arrowExtension last-item"></div>

                    </div>
                    <div id="tab__content" class="tab__content relative">
                        <div id="toastContainer" class="relative mt-3 flex flex-col space-y-20 z-50"></div>
                        <p id="chartContainer"></p>
                    </div>
                </div>
            </section>
        `;

        element.insertAdjacentHTML('afterend', htmlString);

        // Toast
        this.toastContainer = document.getElementById('toastContainer') as HTMLDivElement;

        this.arrowAccordion = document.getElementById('arrowAccordion');
        this.arrowAccordion?.addEventListener('click', onClickArrowAccordionHandler);
        this.accordion = document.getElementById('accordionExtension') as Element;
        this.chartContainer = document.getElementById('chartContainer');
        this.tabContent = document.getElementById('tab__content');
        this.isExpanded = isExpanded || true;
        this.onClickArrowAccordionHandler = onClickArrowAccordionHandler;

        // Init BottomNavigation
        this.bottomNavigation = (this.tabContent) ? new BottomNavigation(this.tabContent, onClickPlayPauseButtonHandler, onClickHideShowMessageButtonHandler, onClickHideShowViewerButtonHandler, onClickClearButtonHandler, onChangeImportHandler, onClickExportButtonHandler, onClickExportImageButtonHandler) : undefined;

        isExpanded ? this.expandChartContainer() : this.collapseChartContainer();
    };

    /**
     * Change svg icon play / pause and update title
     * @param { boolean } newValue
     */
    set isPlaying(newValue: boolean) {
        this.#isPlaying = newValue;
        if (this.bottomNavigation) {
            this.bottomNavigation.isPlaying = this.#isPlaying;
        }
    };

    get isPlaying(): boolean {
        return this.#isPlaying;
    };
        
    set isDisplayViewer(newValue: boolean) {
        this.#isDisplayViewer = newValue;
        if (this.bottomNavigation) {
            this.bottomNavigation.isDisplayLine = this.#isDisplayViewer;
        }
    };

    set isDisplayMessage(newValue: boolean) {
        this.#isDisplayMessage = newValue;
        if (this.bottomNavigation) {
            this.bottomNavigation.isDisplayBar = this.#isDisplayMessage;
        }
    };

    get isDisplayMessage(): boolean {
        return this.#isDisplayMessage;
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
    };

};

