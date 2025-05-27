type summarizeReadyPayload = {
    summary: string;
    time: string
}

const summarizeReady = async ({ summary, time }: summarizeReadyPayload, _sender?: chrome.runtime.MessageSender) => {
    console.log('summarizeReady', summary, time)
};

export { summarizeReady }