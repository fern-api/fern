import { Worker } from "node:worker_threads";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { afterEach, describe, expect, it } from "vitest";

import type { DynamicIrGeneratorJob } from "../dynamicIr/computeDynamicIRs.js";
import {
    DynamicIrWorkerPool,
    getDynamicIrWorkerCount,
    parseDynamicIrResult,
    stripFunctions
} from "../dynamicIr/DynamicIrWorkerPool.js";

// Stands in for the CLI bundle: answers each job by echoing its package names, or misbehaves on request.
const FAKE_WORKER = `
const { parentPort } = require("node:worker_threads");
const { gzipSync } = require("node:zlib");
parentPort.on("message", ({ id, generators, workspace }) => {
    const packageName = generators[0].packageName;
    if (packageName === "crash") {
        process.exit(3);
    }
    if (packageName === "fail") {
        parentPort.postMessage({ id, ok: false, error: "generation failed" });
        return;
    }
    const until = Date.now() + 20;
    while (Date.now() < until) {}
    parentPort.postMessage({
        id,
        ok: true,
        results: generators.map((g) => [g.language, gzipSync(JSON.stringify({ packageName: g.packageName, api: workspace.args.workspaceName }))]),
        logs: [["debug", ["generated " + packageName]]]
    });
});
`;

function createWorkspace(workspaceName: string, definition: unknown = { rootApiFile: {} }): FernWorkspace {
    return new FernWorkspace({
        definition: definition as FernWorkspace["definition"],
        absoluteFilePath: AbsoluteFilePath.of("/tmp/fern"),
        workspaceName,
        cliVersion: "0.0.0",
        generatorsConfiguration: undefined,
        dependenciesConfiguration: { dependencies: {} },
        sources: []
    });
}

function job(packageName: string): DynamicIrGeneratorJob {
    return {
        language: "typescript",
        smartCasing: false,
        smartCasingDigitWordBoundary: undefined,
        packageName,
        dynamicGeneratorConfig: undefined
    };
}

describe("getDynamicIrWorkerCount", () => {
    const GIB = 1024 ** 3;

    it("keeps FERN_DOCS_API_REGISTRATION_CONCURRENCY=1 in-process", () => {
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 1, cores: 16, memoryBytes: 64 * GIB })).toBe(0);
    });

    it("is bounded by registration concurrency and leaves a core for the main thread", () => {
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 4, cores: 16, memoryBytes: 64 * GIB })).toBe(4);
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 8, cores: 4, memoryBytes: 64 * GIB })).toBe(3);
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 4, cores: 1, memoryBytes: 64 * GIB })).toBe(0);
    });

    it("only starts workers that fit in memory next to the main thread", () => {
        // GitHub Actions ubuntu-latest: 2 vCPU / 7 GB (private repos), 4 vCPU / 16 GB (public repos)
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 4, cores: 2, memoryBytes: 7 * GIB })).toBe(0);
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 4, cores: 2, memoryBytes: 9.5 * GIB })).toBe(1);
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 4, cores: 4, memoryBytes: 6 * GIB })).toBe(0);
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 4, cores: 4, memoryBytes: 15.6 * GIB })).toBe(3);
        expect(getDynamicIrWorkerCount({ registrationConcurrency: 8, cores: 16, memoryBytes: 12 * GIB })).toBe(2);
    });
});

describe("stripFunctions", () => {
    it("drops function-valued properties and keeps undefined values and shared references", () => {
        const shared = { value: 1 };
        const input = {
            type: "local",
            _visit: () => 1,
            missing: undefined,
            list: [shared, shared],
            nested: { shared }
        };
        const output = stripFunctions(input);
        expect(output).toEqual({
            type: "local",
            missing: undefined,
            list: [{ value: 1 }, { value: 1 }],
            nested: { shared: { value: 1 } }
        });
        expect(Object.hasOwn(output, "missing")).toBe(true);
        expect(output.list[0]).toBe(output.nested.shared);
        expect(output.list[0]).not.toBe(shared);
    });

    it("handles cycles", () => {
        const input: { self?: unknown } = {};
        input.self = input;
        const output = stripFunctions(input);
        expect(output.self).toBe(output);
    });
});

describe("DynamicIrWorkerPool", () => {
    let pool: DynamicIrWorkerPool | undefined;

    afterEach(async () => {
        await pool?.terminate();
        pool = undefined;
    });

    function createPool(size: number): DynamicIrWorkerPool {
        pool = new DynamicIrWorkerPool(size, () => new Worker(FAKE_WORKER, { eval: true }));
        return pool;
    }

    it("returns each job's own results and logs, without exceeding the pool size", async () => {
        const workerPool = createPool(2);
        const outputs = await Promise.all(
            Array.from({ length: 8 }, (_, index) =>
                workerPool.run(createWorkspace(`api-${index}`), [job(`pkg-${index}`)])
            )
        );
        expect(workerPool.threadCount).toBe(2);
        outputs.forEach((output, index) => {
            expect(
                output.results.map(([language, gzippedJson]) => [
                    language,
                    gzippedJson && parseDynamicIrResult(gzippedJson)
                ])
            ).toEqual([["typescript", { packageName: `pkg-${index}`, api: `api-${index}` }]]);
            expect(output.logs).toEqual([["debug", [`generated pkg-${index}`]]]);
        });
    });

    it("rejects a job the worker failed and keeps serving later jobs", async () => {
        const workerPool = createPool(1);
        await expect(workerPool.run(createWorkspace("a"), [job("fail")])).rejects.toThrow("generation failed");
        await expect(workerPool.run(createWorkspace("b"), [job("ok")])).resolves.toMatchObject({
            results: [["typescript", expect.any(Uint8Array)]]
        });
    });

    it("replaces a worker that crashed mid-job", async () => {
        const workerPool = createPool(1);
        const crashed = workerPool.run(createWorkspace("a"), [job("crash")]);
        const next = workerPool.run(createWorkspace("b"), [job("ok")]);
        await expect(crashed).rejects.toThrow("exited with code 3");
        await expect(next).resolves.toMatchObject({ results: [["typescript", expect.any(Uint8Array)]] });
        expect(workerPool.threadCount).toBe(1);
    });

    it("rejects a workspace that can't be structured-cloned so the caller can fall back in-process", async () => {
        const workerPool = createPool(1);
        await expect(workerPool.run(createWorkspace("a", { visit: () => 1 }), [job("ok")])).rejects.toThrow();
        await expect(workerPool.run(createWorkspace("b"), [job("ok")])).resolves.toBeDefined();
    });

    it("rejects queued jobs when terminated", async () => {
        const workerPool = createPool(1);
        const running = workerPool.run(createWorkspace("a"), [job("ok")]);
        const queued = workerPool.run(createWorkspace("b"), [job("ok")]);
        running.catch(() => undefined);
        const queuedRejection = expect(queued).rejects.toThrow("terminated");
        await workerPool.terminate();
        await queuedRejection;
        expect(workerPool.isTerminated).toBe(true);
        await expect(workerPool.run(createWorkspace("c"), [job("ok")])).rejects.toThrow("terminated");
    });
});
