import { Chart, ScriptableLineSegmentContext } from 'chart.js/auto';
/*import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the plugin to all charts:
Chart.register(ChartDataLabels);*/

// Chart Custom Plugin
import verticalHoverLine from './plugins/verticalHoverLine';
import { customTooltipTitle, customTooltipLabel, customTooltipAfterFooter } from './plugins/customTooltip';
import { customSegmentTooltip } from './plugins/customSegmentTooltip';
//import customDatalabels from './plugins/customDatalabels';

// Types
import { Peak } from '../utils/utils';


export type ChartExtensionData = ChartDataViewer[] | [] | ChartDataMessage[];

 export type ChartDataViewer = {
    duration: string;
    game: string;
    id: number;
    nbViewer: number;
    time: Date | string;
    dataLabel?: string;
    dataLabelColor?: string;
}

export type ChartDataMessage = number


export class ChartExtension {
    container: Element;
    canvas: HTMLCanvasElement | null;
    chart: Chart<"line" | "bar", ChartExtensionData> | null;
    chartTitle: string;
    chartDataViewer = [];
    defaultColor: string = '#fff'; // Label color

    constructor(container: HTMLElement, title?: string, defaultColor?:  string){
        this.container = container;
        this.canvas = null;
        this.chart = null;
        this.chartTitle = title ?? 'Viewers';
        this.chartDataViewer = [];
        this.defaultColor = defaultColor ?? this.defaultColor;

        const height: number = 250;

        const html: string = `<div id="extensionChartContainer" height="${ height }" style="margin-left: 20px;margin-right: 20px;margin-bottom: 10px;"><canvas id="extensionChart" height="${ height }" style="width: 100%"></canvas></div>`;

        if (this.container) {
            this.container.insertAdjacentHTML('afterend', html);
            this.canvas = document.getElementById('extensionChart') as HTMLCanvasElement;
            this._initChart(this.canvas);
        } else {
            console.error("Can't find container");
        }
    };

    _initChart(container: HTMLCanvasElement | null) {
        if (container) {

            this.setDefaultColor(this.defaultColor);

            /**
             * Return value if data is going down
             * @param { ScriptableLineSegmentContext } ctx 
             * @param { string } value 
             * @returns { string | undefined }
             */
            const down = (ctx: ScriptableLineSegmentContext, value: string) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

            /**
             * Return value if data is going up
             * @param { ScriptableLineSegmentContext } ctx 
             * @param { string } value 
             * @returns { string | undefined }
             */
            const up = (ctx: ScriptableLineSegmentContext, value: string) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;

            this.chart = new Chart(container, {
                type: 'line',
                data: {
                  labels: [],
                  datasets: [{
                    stack: 'viewersCount',
                    yAxisID: 'y',
                    data: this.chartDataViewer,
                    segment: {
                        borderColor: ctx => down(ctx, 'rgb(192,75,75)') || up(ctx, 'rgb(24,204,84)') 
                    },
                    parsing: {
                        xAxisKey: 'duration',
                        yAxisKey: 'nbViewer'
                    },
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    order: 0
                  },{
                    stack: 'messagesCount',
                    type: 'bar',
                    data: [],
                    yAxisID: 'y2',
                    order: 1
                  }]
                },
                options: {     
                    hover: {
                        mode: 'nearest',
                        intersect: false
                    }, 
                    plugins: {
                        colors: {
                            forceOverride: true
                        },
                        //datalabels: customDatalabels,
                        tooltip: {
                            enabled: true,
                            mode: 'nearest',
                            caretPadding: 5,
                            intersect: false,
                            footerFont: {
                                size: 11,
                            },
                            callbacks: {
                                title: customTooltipTitle,
                                label: customTooltipLabel,
                                afterFooter: customTooltipAfterFooter
                            },
                        },
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: this.chartTitle
                        }
                    },
                    scales: {
                        y2: { // nbMessage
                            position: 'left',
                            stack: 'chartExtension',
                            offset: true,
                            //stackWeight: 1,
                            beginAtZero: true,
                            ticks: {
                                callback: this.#tickFormatCallback
                            }
                        },
                        y: { // nbViewer
                            position: 'left',
                            stack: 'chartExtension',
                            ticks: {
                                callback: this.#tickFormatCallback
                            }
                            //stackWeight: 2,
                        },
                        
                        x: {
                            ticks: {
                                maxTicksLimit: 10
                            }
                        }
                    },
                    responsive: false,
                },
                plugins: [verticalHoverLine, customSegmentTooltip]
            });
        }
    };

    /**
     * Get ride of decimal for ticks (Y labels)
     * @param { string | number } value 
     * @returns 
     */
    #tickFormatCallback(value: string | number) {
        const tickValue = (typeof value === 'number') ? value : parseInt(value);

        return ~~tickValue;
    }

    public addData(chartDataViewer: ChartDataViewer, messagesCount: number): void {

        //@ts-ignore
        this.chartDataViewer.push(chartDataViewer);

        this.addDataViewers(chartDataViewer, false);
        this.addDataMessagesCount(messagesCount, true);

    };

    private addDataMessagesCount(count: number, update: boolean): void {
        //@ts-ignore
        this.chart?.data.datasets[1].data.push(count);

        if (update)  this.chart?.update();
    };

    private addDataViewers({ duration, nbViewer, game, time, dataLabel, dataLabelColor, id }: ChartDataViewer, update: boolean): void {
        if (this.chart?.data?.labels && duration && nbViewer && !isNaN(nbViewer)) {

            this.chart.data.labels.push(duration);
            //@ts-ignore
            this.chart.data.datasets[0].data.push({ duration, nbViewer, game, time, dataLabel, dataLabelColor, id });

            if (update)  this.chart.update();
        }
    };

    addPeaks(peaks: Peak[]) {
        if (peaks && peaks.length > 0 && this.chart && this.chart?.data?.labels) {

            this.chart.data.datasets.forEach((dataset) => {
                peaks.forEach((peak: Peak) => {
                    let diff: string;
                    if (peak.startValue > peak.endValue) {
                        diff = (peak.startValue - peak.endValue).toString();
                    } else {
                        diff = (peak.endValue - peak.startValue).toString();
                    }
                    
                    dataset.data[peak.endIndex] = {
                        //@ts-ignore
                        ...dataset.data[peak.endIndex],
                        dataLabel: diff
                    }
                })
            });
            this.chart.update('none');
        }
    };

    /**
     * Remove chart from DOM
     */
    destroy(): void {
        if (this.chart){
            this.chart.destroy();
            document.getElementById('extensionChartContainer')?.remove();
        } 
    };

    setDefaultColor(newValue: string) {
        if (newValue){
            this.defaultColor = newValue;
            Chart.defaults.color = newValue;
            Chart.defaults.borderColor = 'transparent';
            Chart.defaults.font.size = 13;
        }
    };

};