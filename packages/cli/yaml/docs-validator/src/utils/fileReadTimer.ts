import { Logger } from "@fern-api/logger";
import { readFile } from "fs/promises";

const SLOW_READ_THRESHOLD_MS = 2000;
const SLOW_READ_OUTLIER_FACTOR = 3;

interface ReadTiming {
    path: string;
    durationMs: number;
    bytes: number;
}

/**
 * Times markdown file reads without throttling them. Reads issued concurrently
 * queue behind Node's libuv threadpool, so an individual read's wall time mostly
 * reflects how many other reads were in flight rather than disk speed. Instead of
 * flagging every read over a fixed threshold, this records all timings and only
 * reports reads that are slow relative to the median of the batch.
 */
export class FileReadTimer {
    private readonly timings: ReadTiming[] = [];
    private readonly startedAt = performance.now();

    public async read(path: string): Promise<string> {
        const start = performance.now();
        const content = await readFile(path, "utf8");
        this.timings.push({ path, durationMs: performance.now() - start, bytes: Buffer.byteLength(content, "utf8") });
        return content;
    }

    public logSummary(logger: Logger, label: string): void {
        if (this.timings.length === 0) {
            return;
        }
        const sorted = [...this.timings].sort((a, b) => a.durationMs - b.durationMs);
        const middle = Math.floor(sorted.length / 2);
        const median =
            sorted.length % 2 === 0
                ? ((sorted[middle - 1]?.durationMs ?? 0) + (sorted[middle]?.durationMs ?? 0)) / 2
                : (sorted[middle]?.durationMs ?? 0);
        const totalBytes = this.timings.reduce((sum, t) => sum + t.bytes, 0);
        const wallMs = performance.now() - this.startedAt;
        logger.debug(
            `Read ${this.timings.length} ${label} files (${(totalBytes / (1024 * 1024)).toFixed(2)} MB) in ${wallMs.toFixed(0)}ms; median per-file wait ${median.toFixed(0)}ms`
        );

        const outlierThreshold = Math.max(SLOW_READ_THRESHOLD_MS, median * SLOW_READ_OUTLIER_FACTOR);
        for (const timing of sorted) {
            if (timing.durationMs > outlierThreshold) {
                logger.debug(
                    `Slow file read: ${timing.path} took ${timing.durationMs.toFixed(0)}ms (${SLOW_READ_OUTLIER_FACTOR}x+ the median of ${median.toFixed(0)}ms)`
                );
            }
        }
    }
}
