
const openSidePanel = async ({ windowId }: { windowId: number }) => {

    chrome.sidePanel.open({ windowId: windowId })
};

export { openSidePanel }