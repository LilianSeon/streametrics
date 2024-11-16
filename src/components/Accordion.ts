// CSS
import '../assets/css/accordion.css';

export type OnClickArrowAccordionHandler = () => void;
export type OnClickClearButtonHandler = () => void;
export type OnClickExportButtonHandler = (event: MouseEvent) => void;
export type OnClickPlayPauseButtonHandler = (isPlaying: boolean) => void;
export type OnClickHideShowMessageButtonHandler = (isPlaying: boolean) => void;
export type OnChangeImportHandler = (event: Event) => Promise<void>;

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
    importButtonContainer: HTMLElement | null;
    importInput: HTMLInputElement | null;
    playPauseButtonContainer: HTMLElement | null;
    hideShowMessageButtonContainer: HTMLElement | null;
    tabContent: HTMLElement | null;
    toastContainer: HTMLDivElement;
    isExpanded: boolean;
    #isPlaying: boolean = true;
    #isDisplayMessage: boolean = true;
    private onChangeImportHandler: OnChangeImportHandler;
    private onClickArrowAccordionHandler: OnClickArrowAccordionHandler;
    private onClickClearButtonHandler: OnClickClearButtonHandler;
    private onClickExportButtonHandler: OnClickExportButtonHandler;
    private onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler;
    private onClickHideShowMessageButtonHandler: OnClickHideShowMessageButtonHandler;

    constructor(element: Element, onClickArrowAccordionHandler: OnClickArrowAccordionHandler, onClickExportButtonHandler: OnClickExportButtonHandler, onChangeImportHandler: OnChangeImportHandler, onClickPlayPauseButtonHandler: OnClickPlayPauseButtonHandler, onClickClearButtonHandler: OnClickClearButtonHandler, onClickHideShowMessageButtonHandler: OnClickHideShowMessageButtonHandler, isExpanded: boolean) {

        const htmlString = `
            <section id="accordionExtension" class="accordionExtension">
                <style>
                    :root {
                        --arrowTransform: rotate(${ isExpanded ? 270 : 90 }deg);
                    }
                </style>
                <div class="tabExtension">
                    <div class="flex-container bg-primary">

                        <button id="hideShowMessageButton" class="tab__clearButton" title="Hide message bars">
                            <svg id="hideMessageIcon" viewBox="0 0 20 20" class="${ this.#isDisplayMessage ? 'show' : 'hide' }" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                                <path fill="#fff" d="M7.820558333333334 3.2087833333333338c0.5503666666666668 -0.14337083333333336 1.1168041666666668 -0.21541250000000003 1.6855375000000004 -0.21422500000000003 1.728841666666667 0 3.386908333333334 0.6867708333333334 4.609320833333334 1.9092625000000003 1.2224916666666668 1.2224916666666668 1.9092625000000003 2.8805583333333336 1.9092625000000003 4.609320833333334 0.0012666666666666668 0.5687333333333334 -0.070775 1.1351708333333335 -0.21414583333333337 1.6855375000000004 -0.032537500000000004 0.11803750000000002 -0.04148333333333334 0.24130000000000004 -0.026283333333333336 0.3627416666666667 0.0152 0.12152083333333334 0.054229166666666676 0.23876666666666668 0.11471250000000001 0.34508750000000005 0.060562500000000005 0.10647916666666668 0.14147083333333335 0.1998166666666667 0.23813333333333336 0.27494583333333333 0.09666250000000001 0.07505 0.20717916666666666 0.13030833333333333 0.32529583333333334 0.1626875 0.08043333333333334 0.009104166666666667 0.16165833333333335 0.009104166666666667 0.2420916666666667 0 0.21026666666666669 0.007125 0.41673333333333334 -0.057 0.5858333333333334 -0.1821625 0.16910000000000003 -0.12508333333333335 0.2908583333333334 -0.3037625 0.34540416666666673 -0.5069833333333333 0.17670000000000002 -0.6999916666666667 0.26109166666666667 -1.4200125000000001 0.25143333333333334 -2.1418541666666666 0 -2.2227625000000004 -0.8829458333333334 -4.3544833333333335 -2.4547208333333335 -5.926258333333334C13.860579166666668 2.0151083333333335 11.7289375 1.1320833333333333 9.506095833333335 1.1320833333333333c-0.7323708333333334 -0.0030083333333333338 -1.46205 0.09096250000000002 -2.1697208333333333 0.2793791666666667 -0.2333041666666667 0.07125000000000001 -0.4293208333333334 0.23108750000000003 -0.5460125 0.44523333333333337 -0.11669166666666668 0.21422500000000003 -0.1446375 0.46557916666666666 -0.07797916666666668 0.7002291666666667 0.06555000000000001 0.23021666666666668 0.21723333333333333 0.42647083333333335 0.4235416666666667 0.5478333333333334 0.2063875 0.1213625 0.4515666666666667 0.15865 0.6846333333333334 0.104025Zm10.727795833333335 14.024295833333335L1.7862375000000001 0.4709625c-0.17535416666666667 -0.17535416666666667 -0.41325000000000006 -0.2739166666666667 -0.6612000000000001 -0.2739166666666667S0.6391916666666667 0.29560833333333336 0.4638375 0.4709625C0.28848333333333337 0.6463166666666668 0.19 0.8841333333333334 0.19 1.1320833333333333s0.09848333333333334 0.4858458333333334 0.2738375 0.6612000000000001l2.5236750000000003 2.4863875C1.7996958333333335 5.765391666666668 1.1526666666666667 7.611004166666667 1.1526666666666667 9.513141666666668c0 1.9022958333333333 0.6470291666666668 3.7477500000000004 1.8348458333333335 5.233550000000001l-1.5924375 1.55515c-0.1292 0.13094166666666668 -0.21675833333333333 0.2972708333333334 -0.2515125 0.47792916666666674 -0.034833333333333334 0.18065833333333334 -0.015358333333333335 0.3674916666666667 0.05597083333333334 0.5370666666666667 0.06990416666666667 0.17005 0.18849583333333336 0.3156375 0.3409708333333334 0.41839583333333336 0.152475 0.10275833333333334 0.3319458333333334 0.15809583333333335 0.5157708333333334 0.15896666666666667h7.449820833333334c1.9054625 -0.007758333333333334 3.7514708333333333 -0.6646833333333334 5.2334708333333335 -1.8623958333333335l2.4863875 2.4956500000000004c0.08660833333333334 0.08724166666666668 0.18960416666666668 0.1565125 0.30305 0.2038541666666667 0.11352500000000001 0.04734166666666667 0.23520416666666666 0.07164583333333334 0.3581500000000001 0.07164583333333334s0.244625 -0.024304166666666672 0.3581500000000001 -0.07164583333333334c0.11344583333333336 -0.04734166666666667 0.21644166666666667 -0.1166125 0.30305 -0.2038541666666667 0.16775416666666668 -0.1736916666666667 0.26164583333333336 -0.4057291666666667 0.26164583333333336 -0.6471875s-0.09389166666666668 -0.473575 -0.26164583333333336 -0.6471875Zm-9.042258333333333 -1.201275H4.300491666666667l0.5960458333333334 -0.5867041666666667c0.17337500000000003 -0.17448333333333335 0.27075000000000005 -0.4104791666666667 0.27075000000000005 -0.6565291666666667 0 -0.24605000000000005 -0.097375 -0.4819666666666667 -0.27075000000000005 -0.6565291666666667 -1.1096000000000001 -1.1095208333333335 -1.7816458333333336 -2.5821791666666667 -1.892875 -4.147383333333334 -0.11115000000000001 -1.565204166666667 0.34595833333333337 -3.118058333333334 1.2875666666666667 -4.373325l9.116754166666668 9.116754166666668c-1.1258291666666667 0.8443125000000001 -2.4946208333333337 1.3016583333333336 -3.9018875000000004 1.3037166666666669Z" fill="#000000" stroke-width="1"></path>
                            </svg>
                            <svg id="showMessageIcon" viewBox="0 0 20 20" class="${ this.#isDisplayMessage ? 'hide' : 'show' }" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                                <path fill="#fff" d="M9.513141666666668 0.2026666666666667c-1.2209083333333335 0 -2.4298625000000005 0.24050833333333338 -3.5578291666666675 0.7077500000000001 -1.1279666666666668 0.46716250000000004 -2.152779166666667 1.1519541666666668 -3.016091666666667 2.0152666666666668C1.1957333333333333 4.669170833333333 0.2162041666666667 7.033879166666667 0.2162041666666667 9.499604166666668c-0.008154166666666667 2.1467625000000004 0.7352208333333333 4.2286875 2.1010833333333334 5.8849333333333345L0.4579000000000001 17.243925c-0.1289625 0.13070416666666668 -0.2163625 0.2967166666666667 -0.25111666666666665 0.4770583333333334 -0.03475416666666667 0.18042083333333334 -0.015279166666666668 0.3670166666666667 0.055891666666666666 0.5362750000000001 0.07726666666666668 0.16727916666666667 0.20242916666666666 0.3078 0.35965416666666666 0.4038291666666667 0.157225 0.09610833333333334 0.3394666666666667 0.14313333333333333 0.5235291666666667 0.13537500000000002h8.367283333333335c2.465725 0 4.830354166666667 -0.9795291666666668 6.573920833333334 -2.7229375 1.7434083333333334 -1.7435666666666667 2.7229375 -4.108195833333334 2.7229375 -6.573920833333334 0 -2.465725 -0.9795291666666668 -4.8304333333333345 -2.7229375 -6.573920833333334C14.343495833333334 1.1821958333333336 11.978866666666667 0.2026666666666667 9.513141666666668 0.2026666666666667Zm0 16.734408333333334h-6.126708333333334l0.8646583333333334 -0.8645791666666668c0.17313750000000003 -0.17424583333333335 0.270275 -0.40976666666666667 0.270275 -0.6554208333333333s-0.09713750000000002 -0.4811750000000001 -0.270275 -0.6554208333333333c-1.2174250000000002 -1.2160791666666668 -1.9754458333333333 -2.8165125000000004 -2.1451000000000002 -4.528729166666667 -0.16965416666666666 -1.7122958333333336 0.2595875 -3.430370833333334 1.2146541666666668 -4.861625C4.2757125 3.9401250000000005 5.697466666666667 2.884279166666667 7.343658333333334 2.3837083333333338c1.646191666666667 -0.5004916666666667 3.4150125 -0.41475416666666676 5.005154166666667 0.24264583333333334 1.5901416666666668 0.6573208333333335 2.903120833333334 1.8457708333333336 3.715291666666667 3.362604166666667 0.8121708333333334 1.5169125 1.0732625 3.268475 0.7387833333333335 4.956308333333334 -0.33440000000000003 1.6878333333333335 -1.2437083333333334 3.2074375 -2.5729958333333336 4.300016666666667 -1.3292083333333335 1.0925791666666669 -2.996141666666667 1.6904458333333334 -4.71675 1.6917916666666668Z" fill="#000000" stroke-width="1"></path>
                            </svg>
                        </button>

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

        // Set hideShowButton callback
        this.hideShowMessageButtonContainer = document.getElementById('hideShowMessageButton');
        this.hideShowMessageButtonContainer?.addEventListener('click', this.onClickHideShowMessageButtonHandlerFunction.bind(this));
        this.onClickHideShowMessageButtonHandler = onClickHideShowMessageButtonHandler;

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

    onClickHideShowMessageButtonHandlerFunction(): void {
        this.onClickHideShowMessageButtonHandler(this.#isDisplayMessage);
    };

    onClickPlayPauseButtonHandlerFunction(): void {
        this.onClickPlayPauseButtonHandler(this.isPlaying);
    };

    set isDisplayMessage(newValue: boolean) {
        this.#isDisplayMessage = newValue;
        const hideMessageIcon = document.getElementById('hideMessageIcon');
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
        }
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
        this.importButtonContainer?.removeEventListener('click', this.#onClickImportButtonHandler);
        this.importInput?.removeEventListener('change', this.onChangeImportHandler); 
        this.playPauseButtonContainer?.removeEventListener('click', this.onClickPlayPauseButtonHandlerFunction);
        this.hideShowMessageButtonContainer?.removeEventListener('click', this.onClickHideShowMessageButtonHandlerFunction);
        this.clearButtonContainer?.removeEventListener('click', this.onClickClearButtonHandler);
    };

};

