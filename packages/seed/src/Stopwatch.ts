import prettyMilliseconds from "pretty-ms";

/** Utility to measure duration */
export class Stopwatch {
    private _start: number | undefined = undefined;
    private _stop: number | undefined = undefined;

    public start(): void {
        this._start = performance.now();
    }

    public stop(): void {
        this._stop = performance.now();
    }

    public duration(): string {
        if (this._start == null || this._stop == null) {
            return "N/A";
        }
        return prettyMilliseconds(this._stop - this._start);
    }
}
