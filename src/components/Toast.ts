// Utils
import { generateRandomId } from '../utils/utils';

// CSS
import '../assets/css/output.css';


export enum ToastMessage {
    importError = 'Incorrect JSON format.',
    importSuccess = 'Data imported successfully.'
};

export type ToastType = 'success' | 'error';

interface IToast<E extends Element> {
    toast: E;
    id: string;
};

export default class Toast implements IToast<Element> {
    toast: Element;
    id: string;
    closeButtonElement: Element | null;

    constructor(type: ToastType, element: Element, message: string) {

        this.id = generateRandomId();

        const htmlString = type === 'success' ? this.#getSuccessToastString(message) : this.#getErrorToastString(message);

        element.insertAdjacentHTML('beforeend', htmlString);

        this.toast = document.getElementById(this.id) as Element;
        this.toast.addEventListener('transitionend', this.#onTransitionEnd.bind(this));

        this.closeButtonElement = document.getElementById(this.#getCloseButtonId()) as Element;
        this.closeButtonElement.addEventListener('click', this.#onClickToast.bind(this));

        setTimeout(() => {
            this.#hideToast();
        }, 2500);
    };

    #onTransitionEnd(_event: Event): void {
        this.destroy();
    };

    /**
     * Success toast
     * @param { string } message Text to display in toast
     * @returns { string } Toast element as string
     */
    #getSuccessToastString(message: string): string {
        return `
            <div id="${ this.id }" style="right: 11px;"class="opacity-100 transition-opacity absolute flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-white dark:bg-darkColor" role="alert">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    <span class="sr-only">Check icon</span>
                </div>
                <div class="ms-3 text-base font-normal">${ message }</div>
                <button id="${ this.#getCloseButtonId() }" type="button" class="ms-auto -mx-1.5 -my-1.5 text-gray-600 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 dark:text-gray-600 dark:hover:text-white" data-dismiss-target="${ this.id }" aria-label="Close">
                    <span class="sr-only">Close</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>
        `;
    };

    /**
     * Error toast
     * @param { string } message Text to display in toast
     * @returns { string } Toast element as string
     */
    #getErrorToastString(message: string): string {
        return `
            <div id="${ this.id }" style="right: 11px;"class="opacity-100 transition-opacity absolute flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-white dark:bg-darkColor" role="alert">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                    </svg>
                    <span class="sr-only">Error icon</span>
                </div>
                <div class="ms-3 text-base font-normal">${ message }</div>
                <button id="${ this.#getCloseButtonId() }" type="button" class="ms-auto -mx-1.5 -my-1.5 text-gray-600 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex items-center justify-center h-8 w-8 dark:text-gray-600 dark:hover:text-white" data-dismiss-target="${ this.id }" aria-label="Close">
                    <span class="sr-only">Close</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>
        `;
    };

    #onClickToast(event: Event): void {
        const getSelector: string | null = (event.currentTarget as HTMLButtonElement).getAttribute('data-dismiss-target');

        if (getSelector) {
            if (document.getElementById(getSelector)!.id === this.toast.id) {
                this.#hideToast();
            }
        }
    };

    /**
     * 
     * @returns { string } close button id
     */
    #getCloseButtonId(): string {
        return 'closeToast-'+this.id;
    };

    /**
     * Set toast opacity to 0
     */
    #hideToast(): void {
        this.toast.classList.remove('opacity-100');
        this.toast.classList.add('opacity-0'); 
    };

    /**
     * Remove toast from DOM
     */
    destroy(): void {
        this.closeButtonElement?.remove();
        this.toast.remove();
        this.toast.removeEventListener('transitionend', this.#onTransitionEnd.bind(this));
        this.closeButtonElement?.removeEventListener('click', this.#onClickToast.bind(this));
    };
};
