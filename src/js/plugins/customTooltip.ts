import { ChartData } from "../chartExtension.js";


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
 * 
 * @param context 
 * @returns { string | string[] } Viewers : 49 562
 */
const customTooltipLabel = (context: any): string | string[] => {
    const { nbViewer } = context.raw as ChartData;
    const { data }: { data: ChartData[] } = context.dataset;
    const { dataIndex } = context;
    const previousValue: number | undefined = (dataIndex > 0) ? data.at(dataIndex - 1)!.nbViewer : undefined;

    const formatNbViewer = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0 });
    const label = (nbViewer >= 1) ? ' Viewers : ' : ' Viewer : ';

    if (typeof previousValue == 'undefined') return label + formatNbViewer.format(nbViewer);

    const diff: number = nbViewer - previousValue;

    if (diff === 0) return label + formatNbViewer.format(nbViewer); // IF there is no differences don't display it
    

    return [label + formatNbViewer.format(nbViewer), diff < 0 ? '▼ '+ diff : '▲ ' + diff];
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
