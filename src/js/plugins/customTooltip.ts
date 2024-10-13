import { ChartDataViewer } from "../chartExtension.js";


/**
 * 
 * @param context 
 * @returns { string } 15/08/2024 17:44:11
 */
const customTooltipAfterFooter = (context: any): string => {

    if (context[0].dataset.stack === 'viewersCount') {
        const { time }: { time: Date } = context[0].raw;

        return time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
    } else if (context[0].dataset.stack === 'messagesCount') {
        return '';
    } else {
        return '';
    }
}

/**
 * Display tooltip's core text 
 * @param context 
 * @returns { string | string[] } Viewers : 49 562 | [" Viewers : 1 520", "▼ -1"]
 */
const customTooltipLabel = (context: any): string | string[] => {
    if (context.dataset.stack === 'viewersCount') {
        const { nbViewer } = context.raw as ChartDataViewer;
        const { data }: { data: ChartDataViewer[] } = context.dataset;
        const { dataIndex } = context;
        const previousValue: number | undefined = (dataIndex > 0) ? data.at(dataIndex - 1)!.nbViewer : undefined;

        const formatNbViewer = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0 });
        const label: string = (nbViewer > 1) ? ' Viewers : ' : ' Viewer : ';
        const formatedString: string = label + formatNbViewer.format(nbViewer);

        if (typeof previousValue == 'undefined') return formatedString;

        const diff: number = nbViewer - previousValue;

        if (diff === 0) return formatedString; // If there is no differences don't display it
        

        return [formatedString, diff < 0 ? '▼ '+ diff : '▲ ' + diff];
    } else if (context.dataset.stack === 'messagesCount') {
        const formattedValue = context.formattedValue;

        return (formattedValue > 1) ? 'New messages : ' + formattedValue : 'New message : ' + formattedValue;
    } else {
        return '';
    }
}

/**
 * 
 * @param context 
 * @returns { string } Game name
 */
const customTooltipTitle = (context: any): string => {
    if (context[0].dataset.stack === 'viewersCount') {
        return context[0].raw.game as string;
    } else if (context[0].dataset.stack === 'messagesCount') {
        return '';
    } else {
        return '';
    }
    
};

export { customTooltipTitle, customTooltipLabel, customTooltipAfterFooter };
