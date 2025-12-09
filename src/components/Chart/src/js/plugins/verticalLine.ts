export const verticalLine = {
    id: 'verticalLine',
    afterDraw(chart: any) {
        const chartExtension = chart.config._config.chartExtensionRef;
        const timestamp = chartExtension?._verticalLineTimestamp;
        if (!timestamp) return;

        const xScale = chart.scales.x;
        const index = chart.data.labels.findIndex((t: any) => t === timestamp);
        if (index === -1) return;

        const x = xScale.getPixelForValue(index);

        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, chart.chartArea.top);
        ctx.lineTo(x, chart.chartArea.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'gray';
        ctx.stroke();
        ctx.restore();
    }
};
