import { ChartExtensionData } from "../js/chartExtension";

export type DataLabelComputed = {
    dataLabel: string;
    dataLabelColor: string;
};

export type ThemeBackgroundColor = 'dark' | 'light';

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

/**
 * Apply a label and color to data if the difference in the number of viewers is to high
 * @param { ChartExtensionData } data 
 * @param { number } nbViewer 
 * @returns { DataLabelComputed | undefined }
 */
const computedDataLabel = (data: ChartExtensionData, nbViewer: number): DataLabelComputed | undefined => {

    if (data && data.length === 0) return;

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

    return { dataLabel: diff.toString(), dataLabelColor };
};

/**
 * @param { Document } document
 * @returns { string } Game name
 */
const getGameName = (document: Document): string => {

    const getHTMLElementByData = document.querySelectorAll<HTMLElement>('[data-a-target="stream-game-link"]')[0]?.innerText;
    const getHTMLElementByClass = document.getElementsByClassName("CoreText-sc-1txzju1-0 dLeJdh")[0]?.innerHTML

    return getHTMLElementByData ?? getHTMLElementByClass;
};

/**
 * @param { Document } document
 * @returns { number } Number of viewer
 */
const getNbViewer = (document: Document): number => {

    const getHTMLElementByData = document.querySelectorAll<HTMLElement>('[data-a-target="animated-channel-viewers-count"]')[0]?.innerText;
    const getHTMLElementByClass = document.getElementsByClassName("ScAnimatedNumber-sc-1iib0w9-0 hERoTc")[0]?.innerHTML

    return parseInt(removeSpaceInString(getHTMLElementByData ?? getHTMLElementByClass));
};

/**
 * @param { Document } document
 * @returns { number } Number of viewer
 */
const getDuration = (document: Document): string | undefined => {

    const getHTMLElementByClass = document.getElementsByClassName("live-time")[0]?.innerHTML

    return getHTMLElementByClass;
};

/**
 * 
 * @param { string | undefined } value 
 * @returns { string }
 */
const removeSpaceInString = (value?: string): string => value ? value.replace(/\s+/g, '') : '';

/**
 * 
 * @param { number } ms 
 * @returns { Promise<unknown> }
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Wait for an HTMLElement to appears in DOM.
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
    });
};

const backGroundThemeObserver = (element: Document, callback: (newTheme: ThemeBackgroundColor) => void) => {
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
          console.log("class was modified!", mutation);
        });
    });

    elmObserver.observe(element.documentElement, { attributes: true });
};

/**
 * Apply chart title format to a string
 * @param { string } string 
 * @returns { string }
 */
const formatChartTitle = (string: string) => {
    return string.replace('/', '') + "'s viewers";
};

export { isURLTwitch, getNbViewer, sleep, waitForElm, getDuration, removeSpaceInString, formatChartTitle, getGameName, computedDataLabel, backGroundThemeObserver };