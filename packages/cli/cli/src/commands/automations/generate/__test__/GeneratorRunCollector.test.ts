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
            durationMs: 10
        });
        const [result] = collector.results();
        expect(result).toMatchObject({
            apiName: "foo",
            groupName: "python-sdk",
            generatorName: "fernapi/fern-python-sdk",
            status: "success",
            version: "0.1.0",
            errorMessage: null,
            pullRequestUrl: null,
            durationMs: 10
        });
        expect(collector.hasFailures()).toBe(false);
    });

    it("recordFailure stores a failed result with null version and error message", () => {
        const collector = new GeneratorRunCollector();
        collector.recordFailure({
            apiName: "foo",
            groupName: "go-sdk",
            generatorName: "fernapi/fern-go-sdk",
            errorMessage: "boom",
            durationMs: 5
        });
        const [result] = collector.results();
        expect(result).toMatchObject({
            status: "failed",
            version: null,
            errorMessage: "boom",
            durationMs: 5
        });
        expect(collector.hasFailures()).toBe(true);
    });

    it("counts aggregate successes and failures correctly", () => {
        const collector = new GeneratorRunCollector();
        collector.recordSuccess({
            apiName: undefined,
            groupName: "g",
            generatorName: "one",
            version: null,
            durationMs: 1
        });
        collector.recordSuccess({
            apiName: undefined,
            groupName: "g",
            generatorName: "two",
            version: null,
            durationMs: 1
        });
        collector.recordFailure({
            apiName: undefined,
            groupName: "g",
            generatorName: "three",
            errorMessage: "e",
            durationMs: 1
        });
        expect(collector.counts()).toEqual({ succeeded: 2, failed: 1, skipped: 0 });
    });

    it("results() preserves insertion order", () => {
        const collector = new GeneratorRunCollector();
        for (const name of ["a", "b", "c"]) {
            collector.recordSuccess({
                apiName: undefined,
                groupName: "g",
                generatorName: name,
                version: null,
                durationMs: 1
            });
        }
        expect(collector.results().map((r) => r.generatorName)).toEqual(["a", "b", "c"]);
    });
});
