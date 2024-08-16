import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the plugin to all charts:
Chart.register(ChartDataLabels);

// Chart Custom Plugin
import verticalHoverLine from './plugins/verticalHoverLine.js';
import { customTooltipTitle, customTooltipLabel, customTooltipAfterFooter } from './plugins/customTooltip.js';
import customDatalabels from './plugins/customDatalabels.js';


export type ChartExtensionData = ChartData[] | [];

 export type ChartData = {
    dataLabel?: string;
    dataLabelColor?: string;
    duration: string;
    game: string;
    nbViewer: number;
    time: Date;
}


export class ChartExtension {
    container: Element;
    canvas: HTMLCanvasElement | null;
    chart: Chart<"line", ChartExtensionData> | null;
    chartTitle: string;
    chartData: ChartExtensionData;

    constructor(container: Element, title?: string){
        this.container = container;
        this.canvas = null;
        this.chart = null;
        this.chartTitle = title ?? 'Viewers';
        this.chartData = [];

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

            this.chart = new Chart(container, {
                type: 'line',
                data: {
                  labels: [],
                  datasets: [{
                    label: this.chartTitle,
                    data: this.chartData,
                    parsing: {
                        xAxisKey: 'duration',
                        yAxisKey: 'nbViewer'
                    },
                    borderWidth: 1,
                    tension: 0.4,
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
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        datalabels: customDatalabels,
                        tooltip: {
                            enabled: true,
                            caretPadding: 5,
                            footerFont: {
                                size: 10,
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
                plugins: [verticalHoverLine]
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

    destroy(): void {
        if (this.chart){
            this.chart.destroy();
            document.getElementById('extensionChartContainer')?.remove();
        } 
    };

};