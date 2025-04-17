// Utils
import { generateRandomId } from '../utils/utils';

// CSS
import '../assets/css/output.css';


export enum ToastMessage {
    downloadError = 'Data could not be downloaded.',
    importError = 'Data could not be imported.',
    importErrorFormat = 'Incorrect JSON format.',
    importSuccess = 'Data imported successfully.',
    interactiveTitle = 'Delete data',
    interactiveMessage = 'Are you sure you want to delete this chart?',
    interactiveButtonYes = 'Yes, I\'m sure',
    interactiveButtonNo = 'No, cancel'
};

export type ToastType = 'success' | 'error' | 'interactive';

interface IToast<E extends Element> {
    toast: E;
    id: string;
};

export default class Toast implements IToast<Element> {
    callback: (() => void) | undefined;
    callbackNo: (() => void) | undefined;
    toast: Element;
    id: string;
    closeButtonElement: Element | null;
    interactiveButtonElementYes: Element | null | undefined;
    interactiveButtonElementNo: HTMLElement | null | undefined;

    constructor(type: ToastType, element: Element, message: string, title?: string, callback?: () => void, callbackNo?: () => void, yesButtonText?: string, noButtonText?: string) {

        this.id = generateRandomId();

        let htmlString = type === 'success' ? this.#getSuccessToastString(message) : this.#getErrorToastString(message);

        switch (type) {
            case 'success':
                htmlString = this.#getSuccessToastString(message);
                break;

            case 'error':
                htmlString = this.#getErrorToastString(message);
                break;

            case 'interactive':
                if (title && yesButtonText && noButtonText) htmlString = this.#getInteractiveToast(title, message, yesButtonText, noButtonText);
                break;
        
            default:
                break;
        }

        element.insertAdjacentHTML('beforeend', htmlString);

        this.toast = document.getElementById(this.id) as Element;
        this.toast.addEventListener('transitionend', this.#onTransitionEnd.bind(this));

        this.closeButtonElement = document.getElementById(this.#getCloseButtonId()) as Element;
        this.closeButtonElement.addEventListener('click', this.#onClickToast.bind(this));

        // If interactive Toast add callback
        if (title && callback && callbackNo) {
            this.interactiveButtonElementYes = document.getElementById('interactiveButton');
            this.callback = callback;
            this.callbackNo = callbackNo;
            this.interactiveButtonElementYes?.addEventListener('click', this.#onClickYes.bind(this));
            this.interactiveButtonElementNo = document.getElementById('interactiveButtonNo');
            this.interactiveButtonElementNo?.addEventListener('click', this.hideToast.bind(this));
        }
        
    };

    #onClickYes() {
        this.hideToast();
        if (this.callback) this.callback();
    };

    #onTransitionEnd(_event: Event): void {
        if (this.callbackNo) this.callbackNo();
        this.destroy();
    };

    #getInteractiveToast(title: string, message: string, yesButtonText: string, noButtonText: string) {
        return `
            <div id="${ this.id }" class="opacity-100 transition-opacity relative w-full max-w-sm p-4 ml-auto text-gray-500 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-400" role="alert">
                <div class="flex">
                    <div class="inline-flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ms-3 text-lg font-normal">
                        <span class="mb-1 text-xl font-semibold text-gray-900 dark:text-white">${ title }</span>
                        <div class="mb-2 text-xl font-normal">${ message }</div> 
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <button id="interactiveButton" class="inline-flex justify-center w-full px-2 py-1.5 text-lg font-medium text-center text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-lg">${ yesButtonText }</button>
                            </div>
                            <div>
                                <button id="interactiveButtonNo" class="inline-flex justify-center w-full px-2 py-1.5 text-lg font-medium text-center text-gray-900 bg-zinc-200 border border-gray-300 rounded-lg hover:bg-zinc-300 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">${ noButtonText }</button> 
                            </div>
                        </div>    
                    </div>
                    <button id="${ this.#getCloseButtonId() }" type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="${ this.id }" aria-label="Close">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    };

    /**
     * Success toast
     * @param { string } message Text to display in toast
     * @returns { string } Toast element as string
     */
    #getSuccessToastString(message: string): string {
        return `
            <div id="${ this.id }" class="opacity-100 transition-opacity relative flex items-center w-full max-w-xs p-4 mb-4 ml-auto text-gray-600 bg-white rounded-lg shadow dark:text-white dark:bg-gray-800" role="alert">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                    </svg>
                    <span class="sr-only">Check icon</span>
                </div>
                <div class="ms-3 text-lg font-medium">${ message }</div>
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
            <div id="${ this.id }" class="opacity-100 transition-opacity relative flex items-center w-full max-w-xs p-4 mb-4 ml-auto text-gray-600 bg-white rounded-lg shadow dark:text-white dark:bg-gray-800" role="alert">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                    </svg>
                    <span class="sr-only">Error icon</span>
                </div>
                <div class="ms-3 text-lg font-medium">${ message }</div>
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
                this.hideToast();
            }
        }
    };

    /**
     * 
     * @returns { string } closeButton id
     */
    #getCloseButtonId(): string {
        return 'closeToast-'+this.id;
    };

    /**
     * Set toast opacity to 0 then remove it when transition end.
     */
    hideToast(): void {
        this.toast.classList.remove('opacity-100');
        this.toast.classList.add('opacity-0');
    };

    /**
     * Remove toast from DOM.
     */
    destroy(): void {
        this.closeButtonElement?.remove();
        this.toast.remove();
        this.toast.removeEventListener('transitionend', this.#onTransitionEnd.bind(this));
        this.closeButtonElement?.removeEventListener('click', this.#onClickToast.bind(this));
        if(this.callback) this.interactiveButtonElementYes?.removeEventListener('click', this.#onClickYes.bind(this));
        if(this.callback) this.interactiveButtonElementNo?.removeEventListener('click', this.hideToast.bind(this));
    };
};
