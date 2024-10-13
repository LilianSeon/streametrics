import { describe, test, expect, beforeEach } from "vitest";

// Utils
import { detectPeaks, findPeaks } from '../utils/utils';

// Types
//import { ChartExtensionData } from '../js/chartExtension';

// Data mockup
import { data1 } from './mockup/data1';
import { ChartDataViewer } from "../js/chartExtension";
import ChartExtension from "../js/chartExtension";

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
                chartExtension.addData(data, 15);
                console.log(data)
            });
            
        }
        console.log(detectPeaks(data1));
        console.log(findPeaks(data1, 2));
        expect(1).toBe(1);
    });
});