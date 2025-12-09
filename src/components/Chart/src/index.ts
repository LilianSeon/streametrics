import { Chart, ScriptableLineSegmentContext } from 'chart.js/auto';
//import zoomPlugin from 'chartjs-plugin-zoom'
import zoomPlugin from './js/ChartjsPluginZoom';
/*import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register the plugin to all charts:
Chart.register(ChartDataLabels);*/

// Chart Custom Plugin
import verticalHoverLine from './js/plugins/verticalHoverLine';
import { customTooltipTitle, customTooltipLabel, customTooltipAfterFooter } from './js/plugins/customTooltip';
import { customSegmentTooltip } from './js/plugins/customSegmentTooltip';
import { verticalLine } from './js/plugins/verticalLine';
//import customDatalabels from './plugins/customDatalabels';

// Types
import { Peak, isArrayOfNumbers, isArray, isString, DownLoadCallbacks, ThemeBackgroundColor } from './utils/utils';
import { Languages } from './js/Texts';

export type DatasetName = "viewersCount" | "messagesCount";

export type ChartExtensionData = ChartDataViewer[] | [] | ChartDataMessage[];

export type ChartDataViewer = {
    duration: string;
    game: string;
    id: number;
    nbViewer: number;
    time: number;
    dataLabel?: string;
    dataLabelColor?: string;
}

export type ChartDataMessage = number

export type ExportedDatas = {
    data: [{ viewersCount: ChartDataViewer[] }, { messagesCount: ChartDataMessage[] }];
    labels: string[];
    title: string;
}

export type ChartDownLoadCallbacks = DownLoadCallbacks;


export default class ChartExtension {
    container: Element;
    canvas: HTMLCanvasElement | null;
    chart: Chart<"line" | "bar", ChartExtensionData> | null;
    chartTitle: string;
    chartDataViewer: ChartDataViewer[] = [];
    defaultColor: ThemeBackgroundColor = 'dark'; // Theme color
    chartDataMessageCount: ChartDataMessage[];
    i18nTexts: Record<string, string>
    _isDocumentHidden: boolean;
    language: Languages;
    #lastZoomLevel: number | undefined;
    _verticalLineTimestamp: number | null = null;

    constructor(container: HTMLElement, language: Languages, i18nTexts: Record<string, string>, title?: string, defaultColor?:  ThemeBackgroundColor){
        this.container = container;
        this.canvas = null;
        this.chart = null;
        this.chartTitle = title || 'Viewers';
        this.chartDataViewer = [];
        this.defaultColor = defaultColor ?? this.defaultColor;
        this.chartDataMessageCount = [];
        this._isDocumentHidden = false;
        this.language = language;
        this.i18nTexts = i18nTexts;

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

    setI18nTexts(newValue: Record<string, string>) {
        this.i18nTexts = newValue;
    };

    _initChart(container: HTMLCanvasElement | null) {
        if (container) {

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
                        xAxisKey: 'time',
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
                        //@ts-ignore
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'x',
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                drag: {
                                    enabled: true,
                                    modifierKey: 'ctrl'
                                },
                                onZoom: ({ chart }: any) => {
                                    const currentZoomLevel = chart.getZoomLevel();
                                    if (this.#lastZoomLevel && this.#lastZoomLevel === currentZoomLevel && currentZoomLevel < 2) {
                                        chart.resetZoom();
                                    }
                                    this.#lastZoomLevel = currentZoomLevel;
                                },
                                mode: 'x',
                            },
                            limits: {
                                x: {
                                  minRange: 4
                                }
                            }
                        },
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
                                label: (context) => customTooltipLabel(context, this.language, this.i18nTexts),
                                afterFooter: (context) => customTooltipAfterFooter(context, this.language, this.i18nTexts)
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
                                callback: this.#tickYFormatCallback.bind(this),
                                maxTicksLimit: 7
                            }
                        },
                        y: { // nbViewer
                            position: 'left',
                            stack: 'chartExtension',
                            beginAtZero: false,
                            ticks: {
                                callback: this.#tickYFormatCallback.bind(this),
                                maxTicksLimit: 7
                            }
                            //stackWeight: 2,
                        },
                        x: {
                            ticks: {
                                callback: this.#tickXFormatCallback.bind(this),
                                maxTicksLimit: 9,
                                display: false
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                },
                plugins: [verticalHoverLine, customSegmentTooltip, verticalLine]
            });

            //@ts-expect-error
            this.chart.config._config.chartExtensionRef = this;

            Chart.register(zoomPlugin);

            this.setDefaultColor(this.defaultColor);
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
            labels: isArrayOfNumbers,
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
                reject(this.i18nTexts.error_import);
            }
        });
    };

    exportImage(): string | null {
        return this.chart ? this.chart.toBase64Image() : null;
    };

    hideXlabels(): void {
        if (this.chart) {
            this.chart.options.scales!.x!.ticks!.display = false;
            this.chart.update();
        }
    };

    showXlabels(): void {
        if (this.chart) {
            this.chart.options.scales!.x!.ticks!.display = true;
            this.chart.update();
        }
    };

    /**
     * Hide viewers count line chart in order to let all space for messages count line
     */
    hideViewersCountDataset(): void {
        if (this.chart) {
            this.chart.data.datasets.find(dataset => dataset.stack === "viewersCount")!.hidden = true;
            this.chart.options.scales!.y!.display = false;
            this.chart.options.scales!.y2!.stack = undefined;
            this.chart.update();
        }
    };

    /**
     * Show viewers count line chart
     */
    showViewersCountDataset(): void {
        if (this.chart) {
            this.chart.data.datasets.find(dataset => dataset.stack === "viewersCount")!.hidden = false;
            this.chart.options.scales!.y!.display = true;
            this.chart.options.scales!.y2!.stack = 'chartExtension';
            this.chart.update();
        }
    };

    /**
     * Hide messages count bars chart in order to let all space for viewers count line
     */
    hideMessagesCountDataset(): void {
        if (this.chart) {
            this.chart.data.datasets.find(dataset => dataset.stack === "messagesCount")!.hidden = true;
            this.chart.options.scales!.y2!.display = false;
            this.chart.options.scales!.y!.stack = undefined;
            //@ts-ignore
            //this.chart.options.scales!.y!.beginAtZero = true;
            this.chart.update();
        }
    };

    /**
     * Display messages count bars chart
     */
    showMessagesCountDataset(): void {
        if (this.chart) {
            this.chart.data.datasets.find(dataset => dataset.stack === "messagesCount")!.hidden = false;
            this.chart.options.scales!.y2!.display = true;
            this.chart.options.scales!.y!.stack = 'chartExtension';
            //@ts-ignore
            //this.chart.options.scales!.y!.beginAtZero = false;
            this.chart.update();
        }
    };

    /**
     * Set language then update X axis labels.
     * @param { Languages } newValue 'en' or 'fr'
     */
    setLanguage(newValue: Languages): void {
        this.language = newValue;
        this.chart?.update();
    };

    /**
     * Format time for ticks (X labels).
     * @param { string | number } value 
     * @returns { number }
     */
    #tickXFormatCallback(value: string | number): string {
        const label: number = parseInt(this.chart?.scales.x.getLabelForValue(value as number) as string);
        return this.formatTimeByLocale(new Date(label), this.language);
    };

    /**
     * Get ride of decimal for ticks (Y labels).
     * @param { string | number } value 
     * @returns { number }
     */
    #tickYFormatCallback(value: string | number): string {
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
            
            this.chart.data.labels.push(time);
            //@ts-ignore
            this.chart.data.datasets[0].data.push({ duration, nbViewer, game, time, id });

            if (update)  this.chart.update();
        }
    };

    /**
     * Formats a Date object as a time string (hours:minutes:seconds)
     * based on the specified locale ('en' for English, 'fr' for French).
     *
     * - English ('en'): 12-hour format with AM/PM
     * - French ('fr'): 24-hour format
     *
     * @param { Date } date - The Date object to format.
     * @param { Languages}  lang - The locale code ('en' or 'fr').
     * @returns { string } - The formatted time string.
     */
    formatTimeByLocale(date: Date, lang: Languages): string {
        return new Intl.DateTimeFormat(lang, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: lang === 'en' // AM/AP for english, 24h pour français
        }).format(date);
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

    setDefaultColor(newValue: ThemeBackgroundColor) {
        if (newValue){
            if (newValue === 'dark') this.setDarkColors()
            if (newValue === 'light') this.setLightColor();

            Chart.defaults.borderColor = 'transparent';
            Chart.defaults.font.size = 13;
            this.chart?.update('none');
        }
    };

    setDarkColors() {
        const darkColor = '#000000';
        this.defaultColor = 'dark';
        Chart.defaults.color = darkColor;
        this.chart!.options!.scales!.x!.ticks!.color = '#ffffff';
        this.chart!.options!.scales!.y!.ticks!.color = '#ffffff';
        this.chart!.options!.scales!.y2!.ticks!.color = '#ffffff';
        this.chart!.options!.plugins!.title!.color = '#ffffff';
        this.chart!.options!.scales!.x!.grid!.display = false;
        this.chart!.options!.scales!.y!.grid!.display = false;
        this.chart!.options!.scales!.y2!.grid!.display = false;
    };

    setLightColor() {
        const lightColor = '#ffffff';
        this.defaultColor = 'light';
        Chart.defaults.color = lightColor;
        this.chart!.options!.scales!.x!.ticks!.color = '#000000';
        this.chart!.options!.scales!.y!.ticks!.color = '#000000';
        this.chart!.options!.scales!.y2!.ticks!.color = '#000000';
        this.chart!.options!.plugins!.title!.color = '#000000';
        this.chart!.options!.scales!.x!.grid!.display = false;
        this.chart!.options!.scales!.y!.grid!.display = false;
        this.chart!.options!.scales!.y2!.grid!.display = false;
    };

    showTooltip(datasetIndex: number = 0, dataIndex: number, shouldUpdate = true): void {
        if (!this.chart) return;
        const tooltip = this.chart.tooltip;
        const chartArea = this.chart.chartArea;

        if (!tooltip) return;

        this.chart.setActiveElements([
            { datasetIndex, index: dataIndex }
        ]);
        tooltip.setActiveElements([
            { datasetIndex, index: dataIndex }
        ], {
            x: (chartArea.left + chartArea.right) / 2,
            y: (chartArea.top + chartArea.bottom) / 2,
        });

        if (shouldUpdate) this.chart.update();
    }

    hideTooltip(shouldUpdate = true) {
        if (!this.chart) return;
        const tooltip = this.chart.tooltip;

        this.chart.setActiveElements([]);
        tooltip?.setActiveElements([], {x: 0, y: 0});
        if (shouldUpdate) this.chart.update();
    }

    showVerticalBarAtTimestamp(timestamp: number): void {
        if (!this.chart || this.chart.data.datasets[0].data.length === 0) return;

        //@ts-expect-error
        this.chart.config._config.chartExtensionRef = this;

        // Trouve l'élément dont le timestamp est le plus proche
        let closest = this.chart.data.datasets[0].data[0];
        //@ts-ignore
        let minDiff = Math.abs(closest.time - timestamp);
        let index = 0;
        let closestIndex = 0;

        for (const point of this.chart.data.datasets[0].data) {
            //@ts-ignore
            const diff = Math.abs(point.time - timestamp);
            if (diff < minDiff) {
                minDiff = diff;
                closest = point;
                closestIndex = index;
            }
            index++;
        }

        this.showTooltip(0, closestIndex, false);
        //@ts-ignore
        this._verticalLineTimestamp = closest.time;
        this.chart.update();
    };

    hideVerticalLine(): void {
        if (!this.chart) return;

        this.hideTooltip(false);
        this._verticalLineTimestamp = null;
        this.chart.update();
    };


};
