import { availableParallelism } from "node:os";
import { getHeapStatistics } from "node:v8";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import { createLogger, type LogLevel } from "@fern-api/logger";
import { createMockTaskContext, TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";

import { computeDynamicIRs, type DynamicIrGeneratorJob } from "./computeDynamicIRs.js";

const WORKER_MARKER = "fernDynamicIrWorker";

/**
 * The CLI entrypoint that branches into {@link runDynamicIrWorkerThread} when started as a worker.
 * Workers are only used once an entrypoint registers itself, so a bundle without that branch never
 * re-runs the CLI inside a worker.
 */
let workerEntrypoint: string | undefined;

export function registerDynamicIrWorkerEntrypoint(scriptPath: string | undefined): void {
    workerEntrypoint = scriptPath;
}

export function isDynamicIrWorkerThread(): boolean {
    return !isMainThread && (workerData as Record<string, unknown> | undefined)?.[WORKER_MARKER] === true;
}

/** FernWorkspace fields as plain data (class instances and functions can't cross a thread boundary). */
interface SerializedFernWorkspace {
    args: Omit<FernWorkspace.Args, "definition">;
    definition: FernWorkspace["definition"];
    sourceDerivedGlobalHeaderNames: string[] | undefined;
}

interface JobRequest {
    id: number;
    workspace: SerializedFernWorkspace;
    generators: DynamicIrGeneratorJob[];
}

type LogEntry = [level: LogLevel, args: string[]];

type JobResponse =
    | { id: number; ok: true; results: Array<[language: string, json: string | undefined]>; logs: LogEntry[] }
    | { id: number; ok: false; error: string };

export interface WorkerDynamicIrResults {
    /** Dynamic IRs as JSON, which is what FDR receives (functions such as `_visit` are dropped). */
    results: Array<[language: string, json: string | undefined]>;
    logs: LogEntry[];
}

export function runDynamicIrWorkerThread(): void {
    const port = parentPort;
    if (port == null) {
        return;
    }
    port.on("message", (request: JobRequest) => {
        const logs: LogEntry[] = [];
        const context = createMockTaskContext({ logger: createLogger((level, ...args) => logs.push([level, args])) });
        let response: JobResponse;
        try {
            const workspace = deserializeWorkspace(request.workspace);
            const results = computeDynamicIRs({ workspace, generators: request.generators, context });
            response = {
                id: request.id,
                ok: true,
                results: results.map(([language, dynamicIR]) => [
                    language,
                    dynamicIR == null ? undefined : JSON.stringify(dynamicIR)
                ]),
                logs
            };
        } catch (error) {
            response = {
                id: request.id,
                ok: false,
                error: error instanceof Error ? (error.stack ?? error.message) : String(error)
            };
        }
        port.postMessage(response);
    });
}

function serializeWorkspace(workspace: FernWorkspace): SerializedFernWorkspace {
    return {
        args: stripFunctions({
            generatorsConfiguration: workspace.generatorsConfiguration,
            workspaceName: workspace.workspaceName,
            cliVersion: workspace.cliVersion,
            absoluteFilePath: workspace.absoluteFilePath,
            changelog: workspace.changelog,
            // FernWorkspace doesn't keep its dependencies config; IR generation reads only `definition`.
            dependenciesConfiguration: { dependencies: {} },
            sources: workspace.sources
        }),
        definition: workspace.definition,
        sourceDerivedGlobalHeaderNames: workspace.definition.sourceDerivedGlobalHeaderNames
    };
}

function deserializeWorkspace({
    args,
    definition,
    sourceDerivedGlobalHeaderNames
}: SerializedFernWorkspace): FernWorkspace {
    if (sourceDerivedGlobalHeaderNames != null) {
        Object.defineProperty(definition, "sourceDerivedGlobalHeaderNames", {
            configurable: true,
            enumerable: false,
            value: sourceDerivedGlobalHeaderNames,
            writable: true
        });
    }
    return new FernWorkspace({ ...args, definition });
}

/** Deep-copies plain data, dropping function-valued properties (e.g. union `_visit` helpers). */
export function stripFunctions<T>(value: T, seen = new Map<object, unknown>()): T {
    if (value == null || typeof value !== "object") {
        return value;
    }
    if (seen.has(value)) {
        return seen.get(value) as T;
    }
    if (Array.isArray(value)) {
        const copy: unknown[] = [];
        seen.set(value, copy);
        for (const item of value) {
            copy.push(typeof item === "function" ? undefined : stripFunctions(item, seen));
        }
        return copy as T;
    }
    const copy: Record<string, unknown> = {};
    seen.set(value, copy);
    for (const [key, item] of Object.entries(value)) {
        if (typeof item !== "function") {
            copy[key] = stripFunctions(item, seen);
        }
    }
    return copy as T;
}

/**
 * Number of dynamic IR workers: at most one per in-flight API registration, and leaving one core
 * for the main thread. 0 means generate in-process.
 */
export function getDynamicIrWorkerCount({
    registrationConcurrency,
    cores = availableParallelism()
}: {
    registrationConcurrency: number;
    cores?: number;
}): number {
    if (registrationConcurrency <= 1) {
        return 0;
    }
    return Math.max(0, Math.min(registrationConcurrency, cores - 1));
}

interface QueuedJob {
    request: JobRequest;
    resolve: (results: WorkerDynamicIrResults) => void;
    reject: (error: Error) => void;
}

/** Generates dynamic IRs on a bounded pool of worker threads, one API (all its languages) per job. */
export class DynamicIrWorkerPool {
    private readonly idle: Worker[] = [];
    private readonly running = new Map<Worker, QueuedJob>();
    private readonly queue: QueuedJob[] = [];
    private workerCount = 0;
    private nextId = 0;
    private terminated = false;

    constructor(
        private readonly size: number,
        private readonly createWorker: () => Worker
    ) {}

    /** Returns a pool when worker threads are usable, or undefined to generate in-process. */
    public static create({
        registrationConcurrency,
        context
    }: {
        registrationConcurrency: number;
        context: TaskContext;
    }): DynamicIrWorkerPool | undefined {
        const size = getDynamicIrWorkerCount({ registrationConcurrency });
        const entrypoint = workerEntrypoint;
        if (size === 0 || entrypoint == null) {
            return undefined;
        }
        context.logger.debug(`Generating dynamic snippet IRs on up to ${size} worker thread(s)`);
        const maxOldGenerationSizeMb = Math.floor(getHeapStatistics().heap_size_limit / 1024 / 1024);
        return new DynamicIrWorkerPool(
            size,
            () =>
                new Worker(entrypoint, {
                    workerData: { [WORKER_MARKER]: true },
                    execArgv: process.execArgv.filter((arg) => arg === "--enable-source-maps"),
                    resourceLimits: { maxOldGenerationSizeMb },
                    stdout: false,
                    stderr: false
                })
        );
    }

    public get threadCount(): number {
        return this.workerCount;
    }

    public get isTerminated(): boolean {
        return this.terminated;
    }

    public run(workspace: FernWorkspace, generators: DynamicIrGeneratorJob[]): Promise<WorkerDynamicIrResults> {
        if (this.terminated) {
            return Promise.reject(new Error("Dynamic IR worker pool was terminated"));
        }
        let request: JobRequest;
        try {
            request = {
                id: this.nextId++,
                workspace: serializeWorkspace(workspace),
                generators: stripFunctions(generators)
            };
        } catch (error) {
            return Promise.reject(error);
        }
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            this.dispatch();
        });
    }

    public async terminate(): Promise<void> {
        this.terminated = true;
        for (const job of this.queue.splice(0)) {
            job.reject(new Error("Dynamic IR worker pool was terminated"));
        }
        const workers = [...this.idle.splice(0), ...this.running.keys()];
        await Promise.all(workers.map((worker) => worker.terminate()));
    }

    private dispatch(): void {
        while (this.queue.length > 0) {
            const worker = this.idle.pop() ?? (this.workerCount < this.size ? this.spawn() : undefined);
            if (worker == null) {
                return;
            }
            const job = this.queue.shift();
            if (job == null) {
                this.idle.push(worker);
                return;
            }
            try {
                worker.postMessage(job.request);
                this.running.set(worker, job);
            } catch (error) {
                // e.g. a DataCloneError for a workspace that isn't plain data; the worker is still usable.
                this.idle.push(worker);
                job.reject(error instanceof Error ? error : new Error(String(error)));
            }
        }
    }

    private spawn(): Worker {
        const worker = this.createWorker();
        this.workerCount++;
        worker.unref();
        let disposed = false;
        worker.on("message", (response: JobResponse) => {
            if (disposed) {
                return;
            }
            const job = this.running.get(worker);
            this.running.delete(worker);
            this.idle.push(worker);
            if (job != null) {
                if (response.ok) {
                    job.resolve({ results: response.results, logs: response.logs });
                } else {
                    job.reject(new Error(response.error));
                }
            }
            this.dispatch();
        });
        const onFailure = (error: Error) => {
            if (disposed) {
                return;
            }
            disposed = true;
            this.removeWorker(worker);
            this.running.get(worker)?.reject(error);
            this.running.delete(worker);
            if (!this.terminated) {
                this.dispatch();
            }
        };
        worker.on("error", onFailure);
        worker.on("exit", (code) => onFailure(new Error(`Dynamic IR worker exited with code ${code}`)));
        return worker;
    }

    /** Forgets a crashed worker so the next job spawns a replacement. */
    private removeWorker(worker: Worker): void {
        const idleIndex = this.idle.indexOf(worker);
        if (idleIndex !== -1) {
            this.idle.splice(idleIndex, 1);
        }
        this.workerCount--;
    }
}
