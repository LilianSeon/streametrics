import { describe, test, expect, beforeEach } from "vitest";

// Utils
import { detectPeaks, findPeaks } from '../utils/utils';

// Types
//import { ChartExtensionData } from '../js/chartExtension';

// Data mockup
import { data1 } from './mockup/data1';
import { ChartDataViewer, ChartExtension } from "../js/chartExtension";

/*const data2: ChartExtensionData = [{
    id: "01:00:00",
    nbViewer: 2,
    duration: "01:00:00",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:01",
    nbViewer: 2,
    duration: "01:00:01",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:02",
    nbViewer: 3,
    duration: "01:00:02",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:03",
    nbViewer: 4,
    duration: "01:00:03",
    game: "CS:GO",
    time: new Date()
    
}, {
    id: "01:00:04",
    nbViewer: 8,
    duration: "01:00:04",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:05",
    nbViewer: 8,
    duration: "01:00:04",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:6",
    nbViewer: 8, // Peak i=6
    duration: "01:00:05",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:07",
    nbViewer: 7,
    duration: "01:00:06",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:08",
    nbViewer: 5,
    duration: "01:00:07",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:09",
    nbViewer: 5,
    duration: "01:00:08",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:10",
    nbViewer: 6, // Peak i=10
    duration: "01:00:09",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:11",
    nbViewer: 2,
    duration: "01:00:10",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:12",
    nbViewer: 2,
    duration: "01:00:11",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:13",
    nbViewer: 3, // Peak i=13
    duration: "01:00:12",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:14",
    nbViewer: 1,
    duration: "01:00:13",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:15",
    nbViewer: 2, // Peak i=15
    duration: "01:00:14",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:16",
    nbViewer: 1,
    duration: "01:00:15",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:17",
    nbViewer: 5,
    duration: "01:00:16",
    game: "CS:GO",
    time: new Date()
}, {
    id: "01:00:18",
    nbViewer: 6, // Peak i=18
    duration: "01:00:17",
    game: "CS:GO",
    time: new Date()
}];*/

let chartExtension: ChartExtension;

describe('Utils functions', () => {

    beforeEach(() => {
        const container = document.createElement('div');
        container.setAttribute("id", "chartContainer")
        document.body.appendChild(container);
        chartExtension = new ChartExtension(container, 'myTitle', '#000000');
        console.log(chartExtension)
    });

    test('detectPeaks', () => {
        console.log(data1)
        if (chartExtension) {
            data1.forEach((data: ChartDataViewer) => {
                chartExtension.addData(data);
                console.log(data)
            });
            
        }
        console.log(detectPeaks(data1));
        console.log(findPeaks(data1, 2));
        expect(1).toBe(1);
    });
});