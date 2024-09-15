
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

            const isAmountOfNewMessagesCloseToChatContainerChildren: boolean = this.#isCloseTo(this.messagesCount - this.previousMessagesCount, this.chatContainer[0].children.length, 3)

            if (this.chatContainer[0].children.length > 0 && isAmountOfNewMessagesCloseToChatContainerChildren) {
                this.messagesCount = 0;
            }
            
        });

        this.observer.observe(this.chatContainer[0], {
            childList: true,
        });
    }

    /**
     * This function will check if the difference between the two numbers is within a certain range.
     * @param { number } number1 
     * @param { number } number2 
     * @param { number } threshold 
     * @returns { boolean }
     */
    #isCloseTo(number1: number, number2: number, threshold: number): boolean {
        return Math.abs(number1 - number2) <= threshold;
    }

    /**
     * Stops observer from observing any mutations.
     */
    public destroy(): void {
        this.observer?.disconnect();
    }
};
