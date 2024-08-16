import { ChartData } from "../chartExtension.js";


/**
 * 
 * @param context 
 * @returns { string } 15/08/2024 17:44:11
 */
const customTooltipAfterFooter = (context: any): string => {
    const { time } = context[0].raw as ChartData;

    return time.toLocaleDateString() + ' ' + time.toLocaleTimeString();
}

/**
 * 
 * @param context 
 * @returns { string } Viewers : 49 562
 */
const customTooltipLabel = (context: any): string => {
    const { nbViewer } = context.raw as ChartData;
    const formatNbViewer = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0 });
    const label = (nbViewer >= 1) ? ' Viewers : ' : ' Viewer : ';

    return label + formatNbViewer.format(nbViewer);
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
