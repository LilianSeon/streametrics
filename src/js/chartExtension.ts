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


export type ChartExtensionData = ChartData[] | [];

 export type ChartData = {
    dataLabel?: string;
    dataLabelColor?: string;
    duration: string;
    game: string;
    id: number;
    nbViewer: number;
    time: Date | string;
}


export class ChartExtension {
    container: Element;
    canvas: HTMLCanvasElement | null;
    chart: Chart<"line", ChartExtensionData> | null;
    chartTitle: string;
    chartData: ChartExtensionData;
    defaultColor: string = '#fff'; // Label color

    constructor(container: HTMLElement, title?: string, defaultColor?:  string){
        this.container = container;
        this.canvas = null;
        this.chart = null;
        this.chartTitle = title ?? 'Viewers';
        this.chartData = [];
        this.defaultColor = defaultColor ?? this.defaultColor;

        const html: string = `<div id="extensionChartContainer" height="200" style="margin-left: 20px;margin-right: 20px;margin-bottom: 10px;"><canvas id="extensionChart" height="200" style="width: 100%"></canvas></div>`;

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

            const down = (ctx: ScriptableLineSegmentContext, value: string) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
            const up = (ctx: ScriptableLineSegmentContext, value: string) => ctx.p0.parsed.y < ctx.p1.parsed.y ? value : undefined;

            this.chart = new Chart(container, {
                type: 'line',
                
                data: {
                  labels: [],
                  datasets: [{
                    label: this.chartTitle,
                    data: this.chartData,
                    segment: {
                        borderColor: ctx => down(ctx, 'rgb(192,75,75)') || up(ctx, 'rgb(24,204,84)') 
                    },
                    parsing: {
                        xAxisKey: 'duration',
                        yAxisKey: 'nbViewer'
                    },
                    borderWidth: 1,
                    tension: 0.3,
                    //@ts-ignore
                    pointRadius: (ctx) => {
                        const pointsLength: number = ctx.chart.data.labels?.length! -1;
                        const pointsArray: number[] = [];

                        for(let i = 0; i <= pointsLength; i++) {
                            if (i === pointsLength) {
                                pointsArray.push(5);
                            } else {
                                pointsArray.push(0);
                            }
                        }

                        return pointsArray;
                    }
                  }]
                },
                options: {     
                    hover: {
                        mode: 'nearest',
                        intersect: false
                    }, 
                    /*interaction: {
                        mode: 'index',
                        intersect: false
                    },*/
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
                            labels: {
                                boxWidth: 0, // Hide color box label
                                font: {
                                    size: 15,
                                    weight: 700
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
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

    addData({ duration, nbViewer, game, time, dataLabel, dataLabelColor}: ChartData): void {
        if (this.chart?.data?.labels && duration && nbViewer && !isNaN(nbViewer)) {

            this.chart.data.labels.push(duration);
            this.chart.data.datasets.forEach((dataset) => {
                //@ts-ignore
                dataset.data.push({ duration, nbViewer, game, time, dataLabel, dataLabelColor });
            });
            this.chart.update();
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
                        ...dataset.data[peak.endIndex],
                        dataLabel: diff
                    }
                })
            });
            this.chart.update('none');
        }
    };

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