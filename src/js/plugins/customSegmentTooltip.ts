import Chart, { InteractionItem } from "chart.js/auto";

export const customSegmentTooltip = {
    id: 'customSegmentTooltip',
    beforeEvent(chart: Chart<"line", number[], string>, args: any, _pluginOptions: any) {
        const { event } = args;
        const { type } = event;

        // Only proceed if the event is of type 'mousemove'
        if (type === 'mousemove') {
            const elements: InteractionItem[] = chart.getElementsAtEventForMode(event, 'point', { intersect: false }, true);

            if (elements.length) {
                const element = elements[0];
                const datasetIndex = element.datasetIndex;
                const index = element.index;

                const dataset = chart.data.datasets[datasetIndex];
                const prevIndex = index > 0 ? index - 1 : null;

                if (prevIndex !== null) {
                    console.log(`Hovered on segment between index ${prevIndex} and ${index}`);
                    console.log(`Previous value: ${dataset.data[prevIndex]}, Current value: ${dataset.data[index]}`);
                }
            }
        }
    }
};
