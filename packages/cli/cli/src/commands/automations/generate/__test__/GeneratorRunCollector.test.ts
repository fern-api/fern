import { describe, expect, it } from "vitest";

import { GeneratorRunCollector } from "../GeneratorRunResult.js";

describe("GeneratorRunCollector", () => {
    it("is empty on construction", () => {
        const collector = new GeneratorRunCollector();
        expect(collector.results()).toHaveLength(0);
        expect(collector.hasFailures()).toBe(false);
        expect(collector.counts()).toEqual({ succeeded: 0, failed: 0, skipped: 0 });
    });

    it("recordSuccess stores a success result with version and null error", () => {
        const collector = new GeneratorRunCollector();
        collector.recordSuccess({
            apiName: "foo",
            groupName: "python-sdk",
            generatorName: "fernapi/fern-python-sdk",
            version: "0.1.0",
            durationMs: 10,
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined,
            outputRepoUrl: "https://github.com/acme/sdk",
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        const [result] = collector.results();
        expect(result).toMatchObject({
            apiName: "foo",
            groupName: "python-sdk",
            generatorName: "fernapi/fern-python-sdk",
            status: "success",
            skipReason: null,
            version: "0.1.0",
            errorMessage: null,
            pullRequestUrl: null,
            noChangesDetected: false,
            durationMs: 10,
            sdkRepoUrl: "https://github.com/acme/sdk"
        });
        expect(collector.hasFailures()).toBe(false);
    });

    it("recordSuccess captures a Fiddle-provided publishTarget verbatim", () => {
        const collector = new GeneratorRunCollector();
        collector.recordSuccess({
            apiName: undefined,
            groupName: "g",
            generatorName: "x",
            version: "0.1.0",
            durationMs: 1,
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: {
                registry: "pypi",
                label: "PyPI",
                version: "0.1.0",
                url: "https://pypi.org/project/acme-sdk/0.1.0/"
            },
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        const [result] = collector.results();
        expect(result?.publishTarget).toEqual({
            registry: "pypi",
            label: "PyPI",
            version: "0.1.0",
            url: "https://pypi.org/project/acme-sdk/0.1.0/"
        });
    });

    it("recordSuccess captures a Fiddle-provided PR URL and no-changes flag", () => {
        const collector = new GeneratorRunCollector();
        collector.recordSuccess({
            apiName: undefined,
            groupName: "g",
            generatorName: "x",
            version: null,
            durationMs: 1,
            pullRequestUrl: "https://github.com/acme/sdk/pull/17",
            noChangesDetected: true,
            publishTarget: undefined,
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        const [result] = collector.results();
        expect(result).toMatchObject({
            status: "success",
            pullRequestUrl: "https://github.com/acme/sdk/pull/17",
            noChangesDetected: true
        });
    });

    it("recordFailure stores a failed result with null version and error message", () => {
        const collector = new GeneratorRunCollector();
        collector.recordFailure({
            apiName: "foo",
            groupName: "go-sdk",
            generatorName: "fernapi/fern-go-sdk",
            errorMessage: "boom",
            durationMs: 5,
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        const [result] = collector.results();
        expect(result).toMatchObject({
            status: "failed",
            skipReason: null,
            version: null,
            errorMessage: "boom",
            durationMs: 5
        });
        expect(collector.hasFailures()).toBe(true);
    });

    it("recordSkipped stores a skipped result with the given reason", () => {
        const collector = new GeneratorRunCollector();
        collector.recordSkipped({
            apiName: "foo",
            groupName: "internal-sdk",
            generatorName: "fernapi/fern-typescript-node-sdk",
            reason: "local_output",
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        const [result] = collector.results();
        expect(result).toMatchObject({
            status: "skipped",
            skipReason: "local_output",
            durationMs: 0,
            errorMessage: null
        });
        expect(collector.counts()).toEqual({ succeeded: 0, failed: 0, skipped: 1 });
    });

    it("counts aggregate successes, failures, and skips correctly", () => {
        const collector = new GeneratorRunCollector();
        collector.recordSuccess({
            apiName: undefined,
            groupName: "g",
            generatorName: "one",
            version: null,
            durationMs: 1,
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined,
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        collector.recordSuccess({
            apiName: undefined,
            groupName: "g",
            generatorName: "two",
            version: null,
            durationMs: 1,
            pullRequestUrl: undefined,
            noChangesDetected: undefined,
            publishTarget: undefined,
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        collector.recordFailure({
            apiName: undefined,
            groupName: "g",
            generatorName: "three",
            errorMessage: "e",
            durationMs: 1,
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        collector.recordSkipped({
            apiName: undefined,
            groupName: "g",
            generatorName: "four",
            reason: "opted_out",
            outputRepoUrl: undefined,
            generatorsYmlAbsolutePath: undefined,
            generatorsYmlLineNumber: undefined
        });
        expect(collector.counts()).toEqual({ succeeded: 2, failed: 1, skipped: 1 });
    });

    it("results() preserves insertion order", () => {
        const collector = new GeneratorRunCollector();
        for (const name of ["a", "b", "c"]) {
            collector.recordSuccess({
                apiName: undefined,
                groupName: "g",
                generatorName: name,
                version: null,
                durationMs: 1,
                pullRequestUrl: undefined,
                noChangesDetected: undefined,
                publishTarget: undefined,
                outputRepoUrl: undefined,
                generatorsYmlAbsolutePath: undefined,
                generatorsYmlLineNumber: undefined
            });
        }
        expect(collector.results().map((r) => r.generatorName)).toEqual(["a", "b", "c"]);
    });
});
