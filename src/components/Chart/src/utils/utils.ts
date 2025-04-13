import { ChartDataViewer, ChartExtensionData, ExportedDatas } from "../index";
import { ChatContainer } from "../js/messageCounter";

export type Peak = {
    endIndex: number,
    endValue: number,
    startIndex: number,
    startValue: number
};

export type DataLabelComputed = {
    dataLabel: string;
    dataLabelColor: string;
};

export type ThemeBackgroundColor = 'dark' | 'light';

export type DownLoadCallbacks = {
    loadstart?: (((ev: ProgressEvent) => any) | null) | (() => any),
    error?: (((ev: ProgressEvent) => any) | null) | (() => any),
    progress?: (((ev: ProgressEvent) => any) | null) | (() => any),
    loadend?: (((ev: ProgressEvent) => any) | null) | (() => any),
};

/**
 * Wait for an HTMLElement to appears in DOM by giving a string selector
 * @param { string } selector 
 * @returns { Promise<Element | null> }
 */
const waitUntilElementLoaded = (selector: string): Promise<Element | null> => {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(_mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
};

const checkStreamerStatus = (document: Document): boolean => {
    return !isNaN(getNbViewer(document));
};

const getCurrentWindowId = async (): Promise<number | undefined> => {

    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getWindowId' }, ({ windowId }: { windowId: number }) => {
            resolve(windowId);
         });
    });
};


const getCurrentTabId = async (): Promise<number> => {

    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getTabId' }, ({ tabId }: { tabId: number }) => {
            resolve(tabId);
         });
    });
};

const deleteStreamerById = async (tabId: number): Promise<boolean> => {

    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ text: 'delete a stream by tabId', tabId }, (isDone) => {
            resolve(isDone);
         });
    });
};

/**
 * Delete continuous value in array
 * @param { ChartDataViewer } arr 
 * @returns { ChartDataViewer }
 */
const deleteSequenceSameNumber = (arr: ChartDataViewer[]): ChartDataViewer[] =>  {
    const n: number = arr.length;

    if (arr.length < 3) {
      return arr; // If the array has less than 3 elements, there is no real sequence to reduce
    }
  
    const resultat: ChartDataViewer[] = [];
    let i: number = 0;
  
    while (i < n) {
      let debut = i;
  
      // Find the end of the sequence of same numbers
      while (i < n - 1 && arr[i].nbViewer === arr[i + 1].nbViewer) {
        i++;
      }
  
      if (debut === i) {
        // If no duplicates, simply add the unique element
        resultat.push(arr[i]);
      } else {
        // If sequence detected, add the first and last element of the sequence
        resultat.push(arr[debut], arr[i]);
      }
  
      i++;
    }
  
    return resultat;
}


/**
 * value.startsWith("https://www.twitch.tv/") ?
 * @param { string } value 
 * @returns { boolean }
 */
const isURLTwitch = (value: string): boolean => {
    return value.startsWith("https://www.twitch.tv/");
};

/**
 * Get the percentage of a number
 * @param { number } percentage 10%
 * @param { number } number 250
 * @example 10% of 250 is 25
 * @returns { number } 25
 */
const getPercentageOf = (percentage: number, number: number): number => {
    return Math.round((percentage * number) / 100);
};

/**
 * Check if difference is between percentage1 and percentage2
 * @param { number } percentage1 
 * @param { number } percentage2 
 * @param { number } value 
 * @param { number } difference 
 * @returns { boolean }
 */
const isBetweenPercentage = (percentage1: number, percentage2: number, value: number, difference: number): boolean => {

    if (difference < 0) {
        return difference <= getPercentageOf(percentage1, value) && difference >= getPercentageOf(percentage2, value);
    } else {
        return difference >= getPercentageOf(percentage1, value) && difference <= getPercentageOf(percentage2, value);
    }
    
};

const findPeaks = (data: ChartExtensionData, threshold: number) => {
    const peaks: Peak[] = [];

    if (typeof data == 'undefined') return;

    // Add a new peak if diff >= threshold
    const addPeak = (newPeak: Peak): void => {
        if (peaks && newPeak) {
            const diff = newPeak.endValue - newPeak.startValue;
            if (diff >= threshold) {
                peaks.push(newPeak);
            }
        }
    };

    // Check first element
    if (data.length > 1 && data.at(0)! > data.at(1)!) {
        let temp5 = 0;
        //@ts-ignore
        while (data.at(temp5 + 1)!.nbViewer <= data.at(temp5 + 2)!.nbViewer) temp5++;
        //@ts-ignore
        addPeak({ endIndex: 0, endValue: data.at(0)!.nbViewer, startIndex: temp5, startValue: data.at(temp5)!.nbViewer });
    }

    // Check middle elements
    for (let i = 0 ; i < data.length; i++) { // For each data elements
        //@ts-ignore
        if (data.at(i + 1)?.nbViewer && data.at(i)!.nbViewer  > data.at(i - 1)!.nbViewer && data.at(i)!.nbViewer  > data.at(i + 1)?.nbViewer ) { // Check if data[i] is supp to data[i-1] AND if data[i] supp to data[i+1]
            let temp1 = i;
            //@ts-ignore
            while (data.at(temp1 - 1)!.nbViewer >= data.at(temp1 - 2)!.nbViewer) temp1--;
            //@ts-ignore
            addPeak({ endIndex: i, endValue: data.at(i)!.nbViewer, startIndex: temp1, startValue: data.at(temp1)!.nbViewer });
            //@ts-ignore
        } else if (data.at(i + 1)?.nbViewer && data.at(i + 2)?.nbViewer && data.at(i)!.nbViewer === data.at(i + 1)!.nbViewer && data.at(i + 1)!.nbViewer > data.at(i + 2)!.nbViewer) {
            let temp2 = i;
            let temp3 = i;
            //@ts-ignore
            while (data.at(temp2)!.nbViewer == data.at(temp2 + 1)!.nbViewer) temp2++;
            //@ts-ignore
            while (data.at(temp3 - 1)!.nbViewer >= data.at(temp3 - 2)!.nbViewer) temp3--;
            //@ts-ignore
            if (data.at(i)?.nbViewer && data.at(temp2)!.nbViewer > data.at(temp2 + 1)!.nbViewer) {
                //@ts-ignore
                addPeak({ endIndex: temp2, endValue: data.at(temp2)!.nbViewer, startIndex: temp3, startValue: data.at(temp3)!.nbViewer });
            }
        }
    }

    // Check last element
    //@ts-ignore
    if (data.length > 1 && data.at(-1)!.nbViewer  > data.at(-2)!.nbViewer ) {
        let temp4 = data.length;
        //@ts-ignore
        while (data[temp4 - 1]!.nbViewer >= data.at(temp4 - 2)!.nbViewer) temp4--;
        //@ts-ignore
        addPeak({ endIndex: data.length - 1, endValue: data.at(-1)!.nbViewer, startIndex: --temp4, startValue: data[temp4-- - 2]!.nbViewer });
    }

    return peaks;
}

const detectPeaks = (arr: ChartExtensionData) => {
    let positions = []
    let maximas = []
    for (let i = 1; i < arr.length - 1; i++) {
        //@ts-ignore
        if (arr.at(i)!.nbViewer > arr.at(i - 1)!.nbViewer) {
            //@ts-ignore
            if (arr.at(i)!.nbViewer > arr.at(i + 1)!.nbViewer) {
                positions.push(i);
                //@ts-ignore
                maximas.push(arr.at(i)!.nbViewer);
                //@ts-ignore
            } else if (arr.at(i)!.nbViewer === arr.at(i + 1)!.nbViewer) {
                let temp = i
                //@ts-ignore
                while (arr.at(i)?.nbViewer === arr.at(temp)?.nbViewer) i++
                //@ts-ignore
                if (arr.at(i)?.nbViewer && arr.at(temp)!.nbViewer > arr.at(i)!.nbViewer) {
                    positions.push(temp)
                    //@ts-ignore
                    maximas.push(arr.at(temp)?.nbViewer)
                }
            }
        }
    }
    return { maximas, positions };
}

/**
 * Apply a label and color to data if the difference in the number of viewers is to high
 * @param { ChartExtensionData } data 
 * @param { number } nbViewer 
 * @returns { DataLabelComputed | undefined }
 */
const computedDataLabel = (data: ChartExtensionData, nbViewer: number): Peak[] | undefined => {

    if (data && data.length === 0) return;
    //@ts-ignore
    const diff = nbViewer - data.at(-1)!.nbViewer;
    
    if (diff === 0) return;

    let dataLabelColor: string = '';

    // Apply color regarding how high is the raise or decreasement
    if (isBetweenPercentage(1, 10, nbViewer, diff) || isBetweenPercentage(-1, -10, nbViewer, diff)) {
        dataLabelColor = '#fff600';
    } else if (isBetweenPercentage(11, 25, nbViewer, diff) || isBetweenPercentage(-11, -25, nbViewer, diff)) {
        dataLabelColor = '#ffc302';
    } else if (isBetweenPercentage(26, 50, nbViewer, diff) || isBetweenPercentage(-26, -50, nbViewer, diff)) {
        dataLabelColor = '#ff8f00';
    } else if (isBetweenPercentage(51, 75, nbViewer, diff) || isBetweenPercentage(-51, -75, nbViewer, diff)) {
        dataLabelColor = '#ff5b00';
    } else if (isBetweenPercentage(76, 100, nbViewer, diff) || isBetweenPercentage(-76, -100, nbViewer, diff)) {
        dataLabelColor = '#ff0505';
    }

    const isColorEmpty: boolean = dataLabelColor === '';

    if (isColorEmpty) return;

    if (data.length > 3) console.log(detectPeaks(data), findPeaks(data, getPercentageOf(2, nbViewer)));

    return findPeaks(data, getPercentageOf(2, nbViewer));
};

/**
 * 
 * @param { Document } document 
 * @returns Return chat node container
 */
const getChatContainer = (document: Document): ChatContainer => {

    const selector = document.querySelectorAll<HTMLElement>('[data-test-selector="chat-scrollable-area__message-container"]');
    const getHTMLElementByClass = document.getElementsByClassName("Layout-sc-1xcs6mc-0 capulb chat-scrollable-area__message-container");

    return selector ?? getHTMLElementByClass;
};

/**
 * 
 * @param { Document } document 
 * @returns { Promise<string> } Return streamer's name, above title
 */
const getStreamerName = (document: Document): Promise<string> => {

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const getHTMLElementByClass = document.getElementsByClassName("CoreText-sc-1txzju1-0 ScTitleText-sc-d9mj2s-0 AAWwv bzDGwQ InjectLayout-sc-1i43xsx-0 dhkijX tw-title")[0]?.innerHTML;
            const getHTMLElementByClassContaining = Array.from(document.getElementsByClassName("tw-title")).filter((element: Element) => element.localName === "h1")[0]?.innerHTML;

            if (getHTMLElementByClass || getHTMLElementByClassContaining) {
                resolve(getHTMLElementByClass ?? getHTMLElementByClassContaining);
                clearInterval(interval);
            }
        }, 500);
    });
};

/**
 * 
 * @param { Document } document  
 * @param { string } streamerName 
 * @returns { Promise<string> }
 */
const getStreamerImage = (document: Document, streamerName: string): Promise<string> => {

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            //@ts-ignore
            const getHTMLElementByClassContaining: string = Array.from(document.getElementsByClassName("tw-image-avatar")).filter((element: Element) => element.alt === streamerName)[0]?.src;

            if (getHTMLElementByClassContaining) {
                resolve(getHTMLElementByClassContaining);
                clearInterval(interval);
            }
        }, 500);
    });
};

/**
 * @param { Document } document
 * @returns { Promise<string> } Game name
 */
const getGameName = (document: Document): Promise<string> => {

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const selector = document.querySelectorAll<HTMLElement>('[data-a-target="stream-game-link"]');

            const getHTMLElementByData = (selector.length > 1) ? selector[1]?.innerText : selector[0]?.innerText; // If is streaming together
            const getHTMLElementByClass = document.getElementsByClassName("CoreText-sc-1txzju1-0 dLeJdh")[0]?.innerHTML

            resolve(getHTMLElementByData ?? getHTMLElementByClass);
            clearInterval(interval);
        }, 500);
    });
};

/**
 * @param { Document } document
 * @returns { number } Number of viewer
 */
const getNbViewer = (document: Document): number => {

    const getHTMLElementByData = document.querySelectorAll<HTMLElement>('[data-a-target="animated-channel-viewers-count"]')[0]?.innerText;
    const getHTMLElementByClass = document.getElementsByClassName("ScAnimatedNumber-sc-1iib0w9-0 hERoTc")[0]?.innerHTML

    return parseInt(removeSpaceInString(getHTMLElementByData ?? getHTMLElementByClass).replace(',', ''));
};

/**
 * @param { Document } document
 * @returns { number } Number of viewer
 */
const getDuration = (document: Document): string | undefined => {

    const getHTMLElementByClass = (document.getElementsByClassName("live-time")[0]?.children[0] as HTMLElement)?.innerText

    return getHTMLElementByClass;
};

/**
 * 
 * @param { string | undefined } value 
 * @returns { string } String without any spaces
 */
const removeSpaceInString = (value?: string): string => value ? value.replace(/\s+/g, '') : '';

/**
 * Wait for an HTMLElement to appears in DOM by giving a string selector, return null if element not found 10 secondes after function call.
 * @param { string } selector 
 * @returns { Promise<Element | null> }
 */
const waitForElm = (selector: string): Promise<Element | null> => {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(_mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Timeout 10 secondes
        setTimeout(() => {
            if (document.querySelector(selector) === null) {
                observer.disconnect();
                resolve(null);
            }
        }, 10000);
    });
};

/**
 * Return true if dark mode is activated
 * @returns { boolean }
 */
const isDarkModeActivated = (): boolean => {
    return document.getElementsByTagName("html")[0].className.includes('dark');
};

/**
 * Observe if element contains `dark` or `light` css class
 * @param { Document } element 
 * @param callback 
 */
const backGroundThemeObserver = (element: Document, callback: (newTheme: ThemeBackgroundColor) => void): void => {
    const elmObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type !== "attributes" && mutation.attributeName !== "class") return;
          //@ts-ignore
          if (mutation.target.className.includes('dark')) {
            callback('dark');
            //@ts-ignore
          } else if (mutation.target.className.includes('light')) {
            callback('light');
          }
        });
    });

    elmObserver.observe(element.documentElement, { attributes: true });
};

/**
 * Apply chart title format to a string
 * @param { string } string 
 * @returns { string } *StreamerName*'s viewers
 */
const formatChartTitle = (string: string): string => {
    return string.replace('/', '') + "'s viewers";
};

/**
 * Export datas from the chart by downloading a json file
 * @param { string } fileName 
 * @param { object } jsonData 
 * @param { DownLoadCallbacks } callBacks XMLHttpRequest events callbacks
 */
const downloadJSON = (fileName: string, jsonData: object, callBacks: DownLoadCallbacks): void => {
    // Convert the JSON data to a string
    const jsonString = JSON.stringify(jsonData, null, 2); // pretty display with indentation

    // Create a Blob with the JSON content
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    startDownload(url, fileName, callBacks);
    URL.revokeObjectURL(url);
};

/**
 * Export image.
 * @param { string } fileName 
 * @param { string } href
 * @param { DownLoadCallbacks } callBacks XMLHttpRequest events callbacks
 */
const downloadImage = (fileName: string, href: string, callBacks: DownLoadCallbacks) => {
    startDownload(href, fileName, callBacks);
};

/**
 * Create a <a> tag with download attribute to upload a file to user.
 * @param { string } url 
 * @param { string } fileName
 * @param { DownLoadCallbacks } callBacks XMLHttpRequest events callbacks
 */
const startDownload = (url: string, fileName: string, callBacks: DownLoadCallbacks): void => {
    let blob: Blob;
    let xmlHTTP = new XMLHttpRequest();
    xmlHTTP.open('GET', url, true);
    xmlHTTP.responseType = 'arraybuffer';

    xmlHTTP.onload = function() {
        blob = new Blob([this.response]);
    };

    xmlHTTP.onloadstart = progress => {
        if (callBacks.loadstart) callBacks.loadstart(progress);
    };

    xmlHTTP.onprogress = progress => {
        if (callBacks.progress) callBacks.progress(progress);
    };

    xmlHTTP.onloadend = progress => {
        const tempEl = document.createElement("a");
        document.body.appendChild(tempEl);
        //@ts-ignore
        tempEl.style = "display: none";
        url = window.URL.createObjectURL(blob);
        tempEl.href = url;
        tempEl.download = fileName;
        tempEl.click();
        document.body.removeChild(tempEl);
        window.URL.revokeObjectURL(url);
        if (callBacks.loadend) callBacks.loadend(progress);
    };

    xmlHTTP.onerror = (progress) => {
        if (callBacks.error) callBacks.error(progress);
    };

    xmlHTTP.send();
};

const extractDataFromJSON = (event: Event, callBacks: DownLoadCallbacks): Promise<ExportedDatas> => {
    return new Promise((resolve: (value: ExportedDatas) => void, reject) => {
        if (event.target instanceof HTMLInputElement) {
            const reader = new FileReader();
            //@ts-ignore
            const file = event.target.files[0];
            reader.readAsText(file, 'UTF-8');
    
            reader.onloadend = readerEvent => {
                const content = readerEvent?.target?.result as string;
                resolve(JSON.parse(content) as ExportedDatas);
                if (callBacks?.loadend) callBacks.loadend(readerEvent);
            };
            
            reader.onerror = (event) => {
                reject(event);
                if (callBacks?.error) callBacks.error(event);
            };

            reader.onabort = (event) => {
                reject(event);
                if (callBacks?.error) callBacks.error(event);
            };

            reader.onloadstart = (event) => {
                if (callBacks?.loadstart) callBacks.loadstart(event);
            };

            reader.onprogress = (progress) => {
                if (callBacks?.progress) callBacks.progress(progress);
            }
        }
    });
};

/**
 * Return true if passed value is type of `string[]`
 * @param { unknown } value 
 * @returns { boolean }
 */
const isArrayOfStrings = (value: unknown): value is [''] => {
    return Array.isArray(value) && value.every(item => typeof item === "string");
};

/**
 * Return true if passed value if an `array`
 * @param { unknown } value 
 * @returns { boolean }
 */
const isArray = (value: unknown): value is [] => {
    return Array.isArray(value);
};

/**
 * Return true if passed value is a string
 * @param { unknown } value 
 * @returns { boolean }
 */
const isString = (value: unknown): value is string => {
    return typeof value === 'string';
};

/**
 * 
 * @returns { string } Random id string
 */
const generateRandomId = (): string => {
    return Math.random().toString(36).substring(2, 8);
};

/**
 * Delay program’s execution for a given number of milliseconds.
 * @param { number } ms 
 * @returns { Promise<unknown> }
 */
const wait = (ms: number): Promise<unknown> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Formats a time value into a human-readable string.
 * @param { number } value - The numeric value representing time units
 * @param { string } singular - The singular form of the time unit
 * @param { string } plural - The plural form of the time unit
 * @param { string } agoText - ago string
 * @returns { string } A formatted string indicating the elapsed time
 */
const formatTimeString = (value: number, singular: string, plural: string, agoText: string): string => {
    return `${ value } ${ value > 1 ? plural : singular } ${ agoText }`;
};

/**
 * Returns a human-readable string representing the time elapsed since a given date.
 * @param { Date } date - The date from which to calculate the elapsed time
 * @returns { string } A formatted string describing how long ago the event occurred
 */
const timeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    //@ts-ignore
    const { singular, plural, ago } = chrome.i18n.getMessage('time_ago');
//@ts-ignore
    if (seconds < 5) return chrome.i18n.getMessage('time_ago').justNow;
    if (seconds < 60) return formatTimeString(seconds, singular.second, plural.second, ago);

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return formatTimeString(minutes, singular.minute, plural.minute, ago);

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return formatTimeString(hours, singular.hour, plural.hour, ago);

    const days = Math.floor(hours / 24);
    if (days < 7) return formatTimeString(days, singular.day, plural.day, ago);
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return formatTimeString(weeks, singular.week, plural.week, ago);
    
    const months = Math.floor(days / 30);
    if (months < 12) return formatTimeString(months, singular.month, plural.month, ago);
    
    const years = Math.floor(days / 365);
    return formatTimeString(years, singular.year, plural.year, ago);
};

export { waitUntilElementLoaded, checkStreamerStatus, deleteStreamerById, getCurrentWindowId, getCurrentTabId, getStreamerImage, timeAgo, isURLTwitch, getNbViewer, waitForElm, wait, getDuration, removeSpaceInString, formatChartTitle, getGameName, computedDataLabel, backGroundThemeObserver, detectPeaks, findPeaks, getPercentageOf, getStreamerName, getChatContainer, deleteSequenceSameNumber, downloadJSON, extractDataFromJSON, isArrayOfStrings, isArray, isString, isDarkModeActivated, generateRandomId, downloadImage };