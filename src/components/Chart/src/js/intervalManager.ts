/**
 * A manager for handling a interval with pause and resume functionality.
 */
export default class IntervalManager {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private start: number = 0;
    private remaining: number = 0; // Remaining time left in milliseconds
    private intervalDuration: number;
    private callback: () => void; // Callback function to execute once the interval completes
    private hasStarted: boolean = false;

    constructor(callback: () => void, intervalDuration: number) {
        this.callback = callback;
        this.intervalDuration = intervalDuration;
        this.remaining = intervalDuration;
        this.play();
    };

    /**
     * Starts the interval if it hasn't been started yet.
     */
    play() {
        if (this.hasStarted) return; // Prevents multiple calls to play from restarting
        this.hasStarted = true;
        this.resume();
    }

    /**
     * Pauses the interval, saving the remaining time
     * clears the current interval and calculates the remaining time.
     */
    pause(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.remaining -= Date.now() - this.start;
            this.hasStarted = false;
        }
    };

    /**
     * Resumes the interval with the remaining time.
     */
    resume(wait: boolean = true): void {
        if (this.intervalId) return; // Avoid creating multiple intervals
        this.start = Date.now();
        
        // Set a timeout for the first tick, then start the interval
        if (wait) {
            this.intervalId = setTimeout(() => {
                this.callback();
                this.intervalId = setInterval(this.callback, this.intervalDuration);
                this.start = Date.now(); // Reset start for accurate future pauses
                this.remaining = this.intervalDuration;
            }, this.remaining);
        } else {
            this.intervalId = setInterval(this.callback, this.intervalDuration);
            this.start = Date.now(); // Reset start for accurate future pauses
            this.remaining = this.intervalDuration;
        }
    };

    /**
     * Clears the interval and resets the remaining time.
     */
    clear(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.remaining = this.intervalDuration;
        this.hasStarted = false;
    };

    /**
     * Update interval.
     * @param { number } newInterval 
     */
    updateInterval(newInterval: number): void {
        this.clear();
        this.intervalDuration = newInterval;
        this.hasStarted = true;
    };
};
