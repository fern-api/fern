import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { appendFile, mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";
const LOGS_FOLDER_NAME = "logs";

// 100 MB cap for the logs directory
const MAX_LOGS_DIR_SIZE_BYTES = 100 * 1024 * 1024;

/**
 * Log level for debug messages
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Individual metric event types from the frontend
 */
export type MetricEventType =
    | "ws_connection"
    | "ws_ping_pong"
    | "reload_start"
    | "reload_finish"
    | "revalidate_api"
    | "router_refresh"
    | "page_render"
    | "full_cycle"
    | "memory";

/**
 * Individual metric event payload from the frontend
 */
export interface MetricEvent {
    type: MetricEventType;
    timestamp: number;
    durationMs?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Statistical summary for a metric type
 */
export interface StatsSummary {
    count: number;
    min: number;
    max: number;
    avg: number;
}

/**
 * Memory usage snapshot
 */
export interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}

/**
 * Aggregate statistics for periodic summaries from the frontend
 */
export interface MetricSummary {
    sessionId: string;
    startTime: number;
    endTime: number;
    totalReloads: number;
    metrics: {
        wsConnectionTime: StatsSummary;
        pingPongLatency: StatsSummary;
        reloadFinishTime: StatsSummary;
        revalidateApiTime: StatsSummary;
        routerRefreshTime: StatsSummary;
        pageRenderTime: StatsSummary;
        fullCycleTime: StatsSummary;
    };
    memory?: MemoryInfo;
}

/**
 * WebSocket message format for metrics from the frontend
 */
export interface MetricsMessage {
    type: "metrics";
    timestamp: string;
    source: string;
    level: LogLevel;
    payload: MetricEvent | MetricSummary;
    isAggregate: boolean;
}

/**
 * CLI-side metric event
 */
export interface CliMetricEvent {
    type: "cli_reload_start" | "cli_reload_finish" | "cli_memory" | "cli_docs_generation" | "cli_validation";
    timestamp: string;
    durationMs?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Debug log entry structure
 */
interface DebugLogEntry {
    timestamp: string;
    source: string;
    level: LogLevel;
    eventType: string;
    isAggregate?: boolean;
    data: unknown;
}

/**
 * Get the CLI version source string in the format "cli@x.x.x"
 */
function getCliSource(): string {
    const version = process.env.CLI_VERSION ?? "unknown";
    return `cli@${version}`;
}

/**
 * DebugLogger class for writing debug logs to a file during `fern docs dev`
 */
export class DebugLogger {
    private logFilePath: AbsoluteFilePath | null = null;
    private initialized = false;
    private sessionStartTime: number;
    private consoleLogger: { debug: (msg: string) => void; info: (msg: string) => void } | undefined;

    constructor() {
        this.sessionStartTime = Date.now();
    }

    /**
     * Initialize the debug logger by creating the log file
     */
    async initialize(consoleLogger?: { debug: (msg: string) => void; info: (msg: string) => void }): Promise<void> {
        if (this.initialized) {
            return;
        }
        this.consoleLogger = consoleLogger;

        const localStorageFolder = join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(LOCAL_STORAGE_FOLDER));
        const logsDir = join(localStorageFolder, RelativeFilePath.of(LOGS_FOLDER_NAME));

        if (!(await doesPathExist(logsDir))) {
            await mkdir(logsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const logFileName = `${timestamp}.debug.log`;
        this.logFilePath = join(logsDir, RelativeFilePath.of(logFileName));

        const header = [
            "================================================================================",
            `Fern Docs Dev Debug Log`,
            `Session started: ${new Date().toISOString()}`,
            `Log file: ${path.basename(this.logFilePath)}`,
            "================================================================================",
            ""
        ].join("\n");

        await writeFile(this.logFilePath, header, "utf-8");
        this.initialized = true;

        // Enforce the 100 MB cap on the logs directory (fire-and-forget)
        void this.enforceLogSizeLimit(logsDir);
    }

    /**
     * Get the path to the log file
     */
    getLogFilePath(): AbsoluteFilePath | null {
        return this.logFilePath;
    }

    /**
     * Write a log entry to the debug file
     */
    private async writeEntry(entry: DebugLogEntry): Promise<void> {
        if (!this.initialized || !this.logFilePath) {
            return;
        }

        const line = JSON.stringify(entry) + "\n";
        try {
            await appendFile(this.logFilePath, line, "utf-8");
        } catch (error) {
            // Silently fail - we don't want debug logging to break the main functionality
        }
    }

    /**
     * Log a frontend metrics message
     */
    async logFrontendMetrics(message: MetricsMessage): Promise<void> {
        const entry: DebugLogEntry = {
            timestamp: message.timestamp,
            source: message.source,
            level: message.level,
            eventType: this.getEventType(message.payload, message.isAggregate),
            isAggregate: message.isAggregate,
            data: message.payload
        };

        await this.writeEntry(entry);
    }

    /**
     * Log a CLI-side metric event
     */
    async logCliMetric(event: CliMetricEvent, level: LogLevel = "info"): Promise<void> {
        const entry: DebugLogEntry = {
            timestamp: event.timestamp,
            source: getCliSource(),
            level,
            eventType: event.type,
            data: {
                durationMs: event.durationMs,
                metadata: event.metadata
            }
        };

        await this.writeEntry(entry);
    }

    /**
     * Log CLI memory usage
     */
    async logCliMemory(): Promise<void> {
        const memUsage = process.memoryUsage();
        const event: CliMetricEvent = {
            type: "cli_memory",
            timestamp: new Date().toISOString(),
            metadata: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss,
                heapUsedMB: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
                heapTotalMB: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
                rssMB: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100
            }
        };

        await this.logCliMetric(event);
    }

    /**
     * Log CLI reload start
     */
    async logCliReloadStart(): Promise<void> {
        const event: CliMetricEvent = {
            type: "cli_reload_start",
            timestamp: new Date().toISOString()
        };

        await this.logCliMetric(event);
    }

    /**
     * Log CLI reload finish with duration
     */
    async logCliReloadFinish(durationMs: number, metadata?: Record<string, unknown>): Promise<void> {
        const event: CliMetricEvent = {
            type: "cli_reload_finish",
            timestamp: new Date().toISOString(),
            durationMs,
            metadata
        };

        await this.logCliMetric(event);
    }

    /**
     * Log CLI docs generation time
     */
    async logCliDocsGeneration(durationMs: number, metadata?: Record<string, unknown>): Promise<void> {
        const event: CliMetricEvent = {
            type: "cli_docs_generation",
            timestamp: new Date().toISOString(),
            durationMs,
            metadata
        };

        await this.logCliMetric(event);
    }

    /**
     * Log CLI validation time
     */
    async logCliValidation(durationMs: number, success: boolean): Promise<void> {
        const event: CliMetricEvent = {
            type: "cli_validation",
            timestamp: new Date().toISOString(),
            durationMs,
            metadata: { success }
        };

        await this.logCliMetric(event);
    }

    /**
     * Delete oldest log files until total directory size is within the cap.
     */
    private async enforceLogSizeLimit(logsDir: AbsoluteFilePath): Promise<void> {
        try {
            const entries = await readdir(logsDir);
            const logFiles = entries.filter((name) => name.endsWith(".log"));

            const fileInfos: Array<{ name: string; fullPath: string; size: number; mtimeMs: number }> = [];
            for (const name of logFiles) {
                const fullPath = path.join(logsDir, name);
                try {
                    const stats = await stat(fullPath);
                    fileInfos.push({ name, fullPath, size: stats.size, mtimeMs: stats.mtimeMs });
                } catch {
                    // File may have been removed between readdir and stat
                }
            }

            let totalSize = fileInfos.reduce((sum, f) => sum + f.size, 0);
            const totalSizeMB = Math.round((totalSize / 1024 / 1024) * 100) / 100;
            const capMB = MAX_LOGS_DIR_SIZE_BYTES / 1024 / 1024;

            if (totalSize <= MAX_LOGS_DIR_SIZE_BYTES) {
                this.consoleLogger?.debug(`Log directory size ${totalSizeMB} MB does not exceed ${capMB} MB cap`);
                return;
            }

            this.consoleLogger?.info(`Rotating logs: total size ${totalSizeMB} MB exceeds ${capMB} MB cap`);

            // Sort oldest first so we delete the oldest logs first
            fileInfos.sort((a, b) => a.mtimeMs - b.mtimeMs);

            for (const file of fileInfos) {
                if (totalSize <= MAX_LOGS_DIR_SIZE_BYTES) {
                    break;
                }
                // Never delete the log file we just created in this session
                if (this.logFilePath != null && file.fullPath === this.logFilePath) {
                    continue;
                }
                try {
                    await unlink(file.fullPath);
                    totalSize -= file.size;
                } catch {
                    // Ignore errors from concurrent deletion
                }
            }
        } catch {
            // If the directory is unreadable, skip cleanup silently
        }
    }

    private getEventType(payload: MetricEvent | MetricSummary, isAggregate: boolean): string {
        if (isAggregate) {
            return "aggregate_summary";
        }
        if ("type" in payload && typeof payload.type === "string") {
            return payload.type;
        }
        return "unknown";
    }

    /**
     * Check if a WebSocket message is a metrics message
     */
    static isMetricsMessage(data: unknown): data is MetricsMessage {
        if (typeof data !== "object" || data === null) {
            return false;
        }
        const obj = data as Record<string, unknown>;
        return obj.type === "metrics" && typeof obj.timestamp === "string" && typeof obj.source === "string";
    }
}
