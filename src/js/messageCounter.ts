
export type MessageTwitch = NodeListOf<HTMLElement> | HTMLCollectionOf<Element>;

export class MessageCounter {
    messages: MessageTwitch;
    previousMessages: MessageTwitch | undefined;

    constructor(messages: MessageTwitch) {

        this.messages = messages;
    }

    public getAmountOfNewMessages(messages: MessageTwitch): number {

        this.previousMessages = this.messages;
        this.messages = messages;

        return this.messages.length - this.previousMessages.length ;
    }
};
