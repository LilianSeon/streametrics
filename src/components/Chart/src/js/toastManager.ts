import Toast, { ToastType } from "../components/Toast";

export type ToastStatus = 'new' | 'in progress' | 'hidden';

type Queue = { type: ToastType, status: ToastStatus, container: HTMLDivElement, message: string, title?: string, callback?: () => void };

export default class ToastManager {
    queue: Map<string, Queue>;
    container: HTMLDivElement;
    limit: number;

    constructor(container: HTMLDivElement, maxVisibleToasts = 2) {
        this.queue = new Map();
        this.container = container;
        this.limit = maxVisibleToasts;
    }

    /**
     * Verify if a toast can be added to the queue.
     * @param { ToastType } type 
     * @returns { boolean }
     */
    #verify(type: ToastType): boolean {
        let hasInteractiveToast: boolean = false;
        let isLimitReach: boolean = this.queue.size >= this.limit;

        this.queue.forEach((value: Queue) => {
            if (value.type === 'interactive' && type === 'interactive') {
                hasInteractiveToast = true;
            }
        });

        return !hasInteractiveToast && !isLimitReach;
    };

    /**
     * Add a toast to the queue.
     * @param { ToastType } type 
     * @param { string } message 
     * @param { string } title 
     * @param { () => void } callback 
     */
    addToQueue(type: ToastType, message: string, title?: string, callback?: () => void): void {
        if (this.#verify(type)) {
            this.queue.set(this.queue.size.toString(), { type, status: 'new', container: this.container, message, title, callback });
            this.#processQueue();
        }
    };

    /**
     * Display new Toast, then remove it from the queue.
     */
    #processQueue(): void {
        if (this.queue.size > 0) { // If queue contains toast
            this.queue.forEach((value: Queue, key: string) => {
                if (value.status === 'new') {
                    const callback = () => {
                        this.queue.delete(key);
                        if (value.callback) value.callback();
                    };
                    const toast = new Toast(value.type, value.container, value.message, value.title, callback, () => { this.queue.delete(key) });
                    const duration = value.type === 'interactive' ? 6 : 3;
                    this.queue.set(key, { ...value, status: 'in progress' });

                    // Automatically hide the toast after the specified duration
                    setTimeout(() => {
                        toast.hideToast();
                        this.queue.delete(key);
                    }, duration * 1000);
                }
            });
        }
    };

};
