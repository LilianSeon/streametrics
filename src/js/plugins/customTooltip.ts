import { ChartDataViewer } from "../chartExtension.js";


/**
 * 
 * @param context 
 * @returns { string } 15/08/2024 17:44:11
 */
const customTooltipAfterFooter = (context: any): string => {
    const { time }: { time: Date } = context[0].raw;

    return time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
}

/**
 * Display tooltip's core text 
 * @param context 
 * @returns { string | string[] } Viewers : 49 562
 */
const customTooltipLabel = (context: any): string | string[] => {
    const { nbViewer } = context.raw as ChartDataViewer;
    const { data }: { data: ChartDataViewer[] } = context.dataset;
    const { dataIndex } = context;
    const previousValue: number | undefined = (dataIndex > 0) ? data.at(dataIndex - 1)!.nbViewer : undefined;

    const formatNbViewer = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0 });
    const label: string = (nbViewer >= 1) ? ' Viewers : ' : ' Viewer : ';
    const formatedString: string = label + formatNbViewer.format(nbViewer);

    if (typeof previousValue == 'undefined') return formatedString;

    const diff: number = nbViewer - previousValue;

    if (diff === 0) return formatedString; // If there is no differences don't display it
    

    return [formatedString, diff < 0 ? '▼ '+ diff : '▲ ' + diff];
}

/**
 * 
 * @param context 
 * @returns { string } Game name
 */
const customTooltipTitle = (context: any): string => {
    return context[0].raw.game;
};

export { customTooltipTitle, customTooltipLabel, customTooltipAfterFooter };
