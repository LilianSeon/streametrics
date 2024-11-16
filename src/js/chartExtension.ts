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
import { Peak, isArrayOfStrings, isArray, isString } from '../utils/utils';
import { ToastMessage } from '../components/Toast';

export type DatasetName = "viewersCount" | "messagesCount";

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

export type ExportedDatas = {
    data: [{ viewersCount: ChartDataViewer[] }, { messagesCount: ChartDataMessage[] }];
    labels: string[];
    title: string;
}


export default class ChartExtension {
    container: Element;
    canvas: HTMLCanvasElement | null;
    chart: Chart<"line" | "bar", ChartExtensionData> | null;
    chartTitle: string;
    chartDataViewer: ChartDataViewer[] = [];
    defaultColor: string = '#fff'; // Label color
    chartDataMessageCount: ChartDataMessage[];
    _isDocumentHidden: boolean;
    language: NavigatorLanguage["language"];

    constructor(container: HTMLElement, title?: string, defaultColor?:  string, language?: NavigatorLanguage["language"]){
        this.container = container;
        this.canvas = null;
        this.chart = null;
        this.chartTitle = title || 'Viewers';
        this.chartDataViewer = [];
        this.defaultColor = defaultColor ?? this.defaultColor;
        this.chartDataMessageCount = [];
        this._isDocumentHidden = false;
        this.language = language || 'en-US';

        const height: number = 250;

        const html: string = `<div id="extensionChartContainer" height="${ height }" style="margin-left: 20px;margin-right: 20px;margin-bottom: 10px;"><canvas id="extensionChart" height="${ height }" style="width: 100%"></canvas></div>`;

        if (this.container) {
            this.container.insertAdjacentHTML('beforeend', html);
            this.canvas = document.getElementById('extensionChart') as HTMLCanvasElement;
            this._initChart(this.canvas);
        } else {
            console.error("Can't find container");
        }

        document.addEventListener( 'visibilitychange' , this.#onVisibilityChanged.bind(this));
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
                    data: [],
                    segment: {
                        borderColor: ctx => down(ctx, 'rgb(192,75,75)') || up(ctx, 'rgb(24,204,84)') 
                    },
                    parsing: {
                        xAxisKey: 'duration',
                        yAxisKey: 'nbViewer'
                    },
                    borderWidth: 2,
                    tension: 0.4,
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
                                label: (context) => customTooltipLabel(context, this.language),
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
                                callback: this.#tickFormatCallback.bind(this)
                            }
                        },
                        y: { // nbViewer
                            position: 'left',
                            stack: 'chartExtension',
                            beginAtZero: false,
                            ticks: {
                                callback: this.#tickFormatCallback.bind(this),
                                maxTicksLimit: 7
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
     * Set chart's title value 
     * @param { string } newValue title value
     * @param { boolean } shouldUpdate true if chart should update render
     */
    setTitle(newValue: string, shouldUpdate: boolean): void {
        if (this.chart?.options.plugins?.title && typeof newValue == 'string') {
            this.chartTitle = newValue;
            this.chart.options.plugins.title.text = this.chartTitle;

            if (shouldUpdate) this.chart?.update();
        }
    };

    /**
     * Clear chart's title value
     */
    clearTitle(): void {
        this.setTitle('', true);
    };

    /**
     * Clear data sets & labels
     */
    clearData(): void {
        if (this.chart) {
            this.chart.data.labels = [];
            this.chart.data.datasets.find(dataset => dataset.stack === "viewersCount")!.data = [];
            this.chart.data.datasets.find(dataset => dataset.stack === "messagesCount")!.data = [];

            this.chart?.update();
        }
    };

    /**
     * Check if ExportedDatas data has valid properties
     * @param { ExportedDatas } data 
     * @returns { boolean }
     */
    #exportedDatasPropertiesCheck(data: ExportedDatas): boolean {
        const sample = {
            data: isArray,
            labels: isArrayOfStrings,
            title: isString
        };

        return Object.entries(sample).every(([prop, check]) => check((data as any)[prop]));
    };

    /**
     * Import a brand new dataset to the chart
     * @param { ExportedDatas } data
     * @return { Promise<boolean> } return true if correctly imported
     */
    importData(data: ExportedDatas): Promise<boolean | string> {

        return new Promise((resolve: (value: boolean) => void, reject: (value: string) =>  void) => {
            // Check if data has the right properties
            if (this.#exportedDatasPropertiesCheck(data)) {

                if (this.chart) {
                    this.chart.data.labels = data.labels;
                    this.chart.data.datasets.find(dataset => dataset.stack === "viewersCount")!.data = data.data[0].viewersCount;
                    this.chart.data.datasets.find(dataset => dataset.stack === "messagesCount")!.data = data.data[1].messagesCount;
                }

                this.setTitle(data.title, true);

                this.chart?.update();

                resolve(true);
            } else {
                reject(ToastMessage.importError);
            }
        });
    };

    /**
     * Hide messages count bars in chart in order to let all space for viewers count line
     */
    hideMessagesCountDataset(): void {
        if (this.chart) {
            this.chart.data.datasets.find(dataset => dataset.stack === "messagesCount")!.hidden = true;
            this.chart.options.scales!.y2!.display = false;
            this.chart.options.scales!.y!.stack = undefined;
            //@ts-ignore
            this.chart.options.scales!.y!.beginAtZero = true;
            this.chart.update();
        }
    };

    /**
     * Display messages count bars in chart
     */
    showMessagesCountDataset(): void {
        if (this.chart) {
            this.chart.data.datasets.find(dataset => dataset.stack === "messagesCount")!.hidden = false;
            this.chart.options.scales!.y2!.display = true;
            this.chart.options.scales!.y!.stack = 'chartExtension';
            //@ts-ignore
            this.chart.options.scales!.y!.beginAtZero = false;
            this.chart.update();
        }
    };

    /**
     * Get ride of decimal for ticks (Y labels).
     * @param { string | number } value 
     * @returns { number }
     */
    #tickFormatCallback(value: string | number): string {
        const tickValue = (typeof value === 'number') ? value : parseInt(value);
        return new Intl.NumberFormat(this.language).format(~~tickValue);
    };

    get isDocumentHidden() {
        return this._isDocumentHidden;
    };

    set isDocumentHidden(newValue: boolean) {
        this._isDocumentHidden = newValue;
    }

    #onVisibilityChanged() {
        this._isDocumentHidden = document.hidden;
    };

    /**
     * Get datas from the chart
     * @returns { ExportedDatas }
     */
    getDatas(): ExportedDatas {
        const data = this.chart?.data.datasets.map((dataset) => {
            return {
                [dataset.stack as string]: dataset.data
            }
        });
        const labels = this.chart?.data.labels;

        return { data, labels, title: this.chartTitle } as ExportedDatas;
    };

    addData(chartDataViewer: ChartDataViewer, messagesCount: ChartDataMessage): void {
        
        if (this._isDocumentHidden) { // If _isDocumentHidden is true, the user is not focusing the document anymore, therefore we keep data in memory in order to update chart later.
            this.chartDataViewer.push(chartDataViewer);
            this.chartDataMessageCount.push(messagesCount);
        } else {
            if (this.chartDataMessageCount.length > 0 && this.chartDataViewer.length > 0) {

                this.#addManyDatas(this.chartDataMessageCount, this.chartDataViewer);

            } else {
                this.addDataViewers(chartDataViewer, false);
                this.addDataMessagesCount(messagesCount, true);
            }
        }

        //localStorage.setItem(this.chartTitle, `{ dataViewer: ${this.chartDataViewer.map((data: any) => JSON.stringify(data))}, messagesCount: ${this.chartDataMessageCount}}`);
    };

    /**
     * Add chartDataMessageCount and chartDataViewer to the chart when user is focusing the document
     * @param { ChartDataMessage[] } chartDataMessageCount 
     * @param { ChartDataViewer[] } chartDataViewer 
     */
    #addManyDatas(chartDataMessageCount: ChartDataMessage[], chartDataViewer: ChartDataViewer[]): void {
        chartDataMessageCount.forEach((messagesCount: ChartDataMessage) => {
            this.addDataMessagesCount(messagesCount, false);
        });

        chartDataViewer.forEach((dataViewer) => {
            this.addDataViewers(dataViewer, false);
        });

        this.chartDataMessageCount = [];
        this.chartDataViewer = [];

        this.chart?.update();
    }

    private addDataMessagesCount(count: number, update: boolean): void {

        if (count < 0) { // Message count can't be under 0
            //@ts-ignore
            this.chart?.data.datasets[1].data.push(0);
        } else {
            //@ts-ignore
            this.chart?.data.datasets[1].data.push(count);
        } 

        if (update)  this.chart?.update();
    };

    private addDataViewers({ duration, nbViewer, game, time, id }: ChartDataViewer, update: boolean): void {
        if (this.chart?.data?.labels && duration && nbViewer && !isNaN(nbViewer)) {

            this.chart.data.labels.push(duration);
            //@ts-ignore
            this.chart.data.datasets[0].data.push({ duration, nbViewer, game, time, id });

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
            document.removeEventListener('visibilitychange', this.#onVisibilityChanged);
        } 
    };

    setDefaultColor(newValue: string) {
        if (newValue){
            this.defaultColor = newValue;
            Chart.defaults.color = newValue;
            Chart.defaults.borderColor = 'transparent';
            Chart.defaults.font.size = 13;
            this.chart?.update('none');
        }
    };

};