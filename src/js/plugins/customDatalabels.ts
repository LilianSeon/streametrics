import { Context } from "chartjs-plugin-datalabels";
import { ChartDataViewer } from "../chartExtension";
import { Options } from "chartjs-plugin-datalabels/types/options";

const customDatalabels: Options = {
    align: 'top',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(128, 128, 128, 0.9)',
    borderRadius: 4,
    borderWidth: 1,
    anchor: 'end',
    display: function(context): boolean {
        const i = context.dataIndex;
        //@ts-ignore
        return (context.dataset.data[i]?.dataLabel) ? true : false;
    },
    color: function(_context: Context) {
        //const i = context.dataIndex;
        //@ts-ignore
        //return context.dataset.data[i]?.dataLabelColor;
        return '#000'
    },
    font: {
        size: 11,
        weight: 'bold',
    },
    offset: 8,
    formatter: function(value: ChartDataViewer, _context: Context) {
        const glyph = value.dataLabel?.includes('-') ? '▼' : '▲';

        return glyph + ' ' + value.dataLabel + ' 👤';
    },
    padding: 6
};

export default customDatalabels;