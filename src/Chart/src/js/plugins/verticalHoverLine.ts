import Chart from 'chart.js/auto';

interface VerticalHoverLinePlugin {
    id: string;
    beforeDatasetDraw(chart: Chart<"line", number[], string>): void;
};

/**
 * @typedef VerticalHoverLinePlugin
 * @type { object }
 * @property { string } id - an ID.
 * @property { (chart: Chart<"line", number[], string>): void } beforeDatasetDraw - Function that draw a line for each dataPoint on hover
 */
const verticalHoverLine: VerticalHoverLinePlugin = {
    id: 'verticalHoverLine',
    beforeDatasetDraw(chart: Chart<"line", number[], string>) {
        const { ctx, chartArea: { top, bottom }} = chart;

        ctx.save();

        chart.getDatasetMeta(0).data.forEach((dataPoint) => {
            if(dataPoint.active) {
                ctx.beginPath();
                ctx.strokeStyle = 'gray';
                ctx.moveTo(dataPoint.x, top);
                ctx.lineTo(dataPoint.x, bottom);
                ctx.stroke();
            }
        });
    }
};

export default verticalHoverLine;
