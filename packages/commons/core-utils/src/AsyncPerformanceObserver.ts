import { v4 } from "uuid";
import { PerformanceObserver, performance } from "perf_hooks";

export class AsyncPerformanceObserver {
    private observer: PerformanceObserver;

    constructor(
        private readonly logger: {
            info: (message: string) => void;
        }
    ) {
        this.observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                logger.info(`${entry.name} took ${entry.duration}ms`);
            }
        });
        this.observer.observe({ type: "measure" });
    }

    public async measureAsync<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
        const mark = `${fn.name}-${v4()}`;
        performance.mark(mark);
        const result = await fn(...args);
        performance.mark(`${mark}-finished`);
        performance.measure(fn.name, mark, `${mark}-finished`);
        return result;
    }

    public measureSync<T>(fn: (...args: any[]) => T, ...args: any[]): T {
        const mark = `${fn.name}-${v4()}`;
        performance.mark(mark);
        const result = fn(...args);
        performance.mark(`${mark}-finished`);
        performance.measure(fn.name, mark, `${mark}-finished`);
        return result;
    }
}
