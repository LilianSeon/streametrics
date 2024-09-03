
export type ChatContainer = NodeListOf<HTMLElement> | HTMLCollectionOf<Element>;

export class MessageCounter {
    chatContainer: ChatContainer;
    observer: MutationObserver | null;
    messagesCount: number;
    previousMessagesCount: number;

    constructor(chatContainer: ChatContainer) {

        this.chatContainer = chatContainer;
        this.observer = null;
        this.messagesCount = 0;
        this.previousMessagesCount = 0;

        this.#observeAmountOfNewMessages();
    }

    /**
     * @param { number } previousMessagesCount last messages count (this.previousMessagesCount)
     * @return { number } Difference between current messages count and previous messages count
     */
    public getAmountOfNewMessages(previousMessagesCount: number): number {

        this.previousMessagesCount = this.messagesCount;

        return this.messagesCount - previousMessagesCount;
    }

    /**
     * Watch chat HTML container when child get updated
     * set messagesCount to number of added noodes.
     */
     #observeAmountOfNewMessages(): void {
        this.observer = new MutationObserver((mutations: MutationRecord[]) => {
            mutations.forEach((mutation) => {
                this.messagesCount += mutation.addedNodes.length;
            });
        });

        this.observer.observe(this.chatContainer[0], {
            childList: true,
            subtree: true
        });
    }

    /**
     * Stops observer from observing any mutations.
     */
    public destroy(): void {
        this.observer?.disconnect();
    }
};
