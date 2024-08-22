// CSS
import '../assets/css/accordion.css';

export type OnClickArrowAccordionHandler = () => void;

interface IAccordion<E extends Element> {
    arrowAccordion: E | null;
    accordion: E;
    isExpanded: boolean;
    expandChartContainer(): void;
    collapseChartContainer(): void;
    getAccordionElement(): Element;
    getChartContainer(): Element | null;
}


export default class Accordion implements IAccordion<Element> {
    arrowAccordion: HTMLElement | null;
    accordion: Element;
    chartContainer: HTMLElement | null;
    tabContent: HTMLElement | null;
    isExpanded: boolean;

    constructor(element: Element, onClickArrowAccordionHandler: OnClickArrowAccordionHandler, isExpanded: boolean) {
        const htmlString = `
            <style>
                :root {
                    --arrowTransform: rotate(${isExpanded ? 270 : 90}deg);
                }
            </style>
            <section id="accordionExtension" class="accordionExtension">
                <div class="tabExtension">
                    <div class="flex-container bg-primary">
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

        this.arrowAccordion = document.getElementById('arrowAccordion');
        this.arrowAccordion?.addEventListener('click', onClickArrowAccordionHandler);
        this.accordion = document.getElementById('accordionExtension') as Element;
        this.chartContainer = document.getElementById('chartContainer');
        this.tabContent = document.getElementById('tab__content');
        this.isExpanded = isExpanded;

        isExpanded ? this.expandChartContainer() : this.collapseChartContainer();
    }

    getAccordionElement(): Element {
        return this.accordion;
    }

    getChartContainer(): Element | null {
        return this.chartContainer;
    }

    expandChartContainer(): void {
        if (this.tabContent && this.arrowAccordion) {
            this.tabContent.style.maxHeight = '250px';
            //this.arrowAccordion.classList.toggle('rotate');
            this.arrowAccordion.style.setProperty('--arrowTransform', 'rotate(270deg)');
            this.isExpanded = true;
        }
    }

    collapseChartContainer(): void {
        if (this.tabContent && this.arrowAccordion) {
            this.tabContent.style.maxHeight = '0px';
            //this.arrowAccordion.classList.toggle('rotate');
            this.arrowAccordion.style.setProperty('--arrowTransform', 'rotate(90deg)');
            this.isExpanded = false;
        }
    }

};

