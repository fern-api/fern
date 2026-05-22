import { describe, expect, it } from "vitest";

import {
    deriveGeneratorCompletedOutcome,
    generationRunAttributes,
    generatorCompletedAttributes,
    generatorFailedAttributes,
    previewGroupCompletedAttributes,
    previewGroupFailedAttributes,
    previewRunAttributes
} from "../automationTelemetryAttributes.js";

describe("automationTelemetryAttributes", () => {
    it("derives pr_created when a pull request URL is present", () => {
        expect(
            deriveGeneratorCompletedOutcome({
                pullRequestUrl: "https://github.com/acme/sdk/pull/1",
                noChangesDetected: false,
                publishTarget: undefined
            })
        ).toBe("pr_created");
    });

    it("derives no_diff when Fiddle reported no changes", () => {
        expect(
            deriveGeneratorCompletedOutcome({
                pullRequestUrl: undefined,
                noChangesDetected: true,
                publishTarget: undefined
            })
        ).toBe("no_diff");
    });

    it("derives published when a registry target is present", () => {
        expect(
            deriveGeneratorCompletedOutcome({
                pullRequestUrl: undefined,
                noChangesDetected: false,
                publishTarget: {
                    registry: "pypi",
                    label: "PyPI",
                    version: "1.0.0",
                    url: "https://pypi.org/project/acme/1.0.0/"
                }
            })
        ).toBe("published");
    });

    it("builds generator_completed attributes with outcome", () => {
        expect(
            generatorCompletedAttributes({
                generatorName: "fernapi/fern-python-sdk",
                groupName: "python-sdk",
                apiName: "api",
                sdkRepoUrl: "https://github.com/acme/sdk",
                version: "1.0.0",
                pullRequestUrl: "https://github.com/acme/sdk/pull/1",
                noChangesDetected: false,
                publishTarget: undefined
            })
        ).toMatchObject({
            generator_name: "fernapi/fern-python-sdk",
            group_name: "python-sdk",
            api_name: "api",
            outcome: "pr_created",
            version: "1.0.0"
        });
    });

    it("builds generator_failed attributes with failure_source", () => {
        expect(
            generatorFailedAttributes({
                generatorName: "x",
                groupName: "g",
                apiName: undefined,
                sdkRepoUrl: undefined,
                errorMessage: "boom",
                failureSource: "cli"
            })
        ).toEqual({
            generator_name: "x",
            group_name: "g",
            error_message: "boom",
            failure_source: "cli"
        });
    });

    it("builds generation_completed run aggregates", () => {
        expect(generationRunAttributes({ succeeded: 2, failed: 1, skipped: 1 })).toEqual({
            succeeded: 2,
            failed: 1,
            skipped: 1
        });
    });

    it("builds preview_group_completed attributes", () => {
        expect(
            previewGroupCompletedAttributes({
                groupName: "ts-sdk",
                apiName: "api",
                generatorName: "fernapi/fern-typescript-sdk",
                previewCount: 2,
                pushDiffEnabled: true,
                hasDiffUrl: false
            })
        ).toMatchObject({
            group_name: "ts-sdk",
            api_name: "api",
            generator_name: "fernapi/fern-typescript-sdk",
            preview_count: 2,
            push_diff_enabled: true,
            has_diff_url: false
        });
    });

    it("builds preview_group_failed attributes with failure_source", () => {
        expect(
            previewGroupFailedAttributes({
                groupName: "ts-sdk",
                apiName: undefined,
                generatorName: "fernapi/fern-typescript-sdk",
                errorMessage: "boom",
                failureSource: "container"
            })
        ).toEqual({
            group_name: "ts-sdk",
            generator_name: "fernapi/fern-typescript-sdk",
            error_message: "boom",
            failure_source: "container"
        });
    });

    it("builds preview_completed run aggregates", () => {
        expect(previewRunAttributes({ succeeded: 1, failed: 2 })).toEqual({
            succeeded: 1,
            failed: 2
        });
    });
});
