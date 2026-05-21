import type { PipelineResult, VerificationStepResult } from "@fern-api/generator-cli/pipeline";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { assertVerifyPipelineSucceeded } from "../assertVerifyPipelineSucceeded.js";

const GENERATOR_NAME = "fernapi/fern-typescript-sdk";

function makeVerifyResult(overrides: Partial<VerificationStepResult> = {}): VerificationStepResult {
    return {
        executed: true,
        success: true,
        skipped: false,
        ...overrides
    };
}

describe("assertVerifyPipelineSucceeded", () => {
    it("no-ops on a successful pipeline result", () => {
        const result: PipelineResult = {
            success: true,
            steps: { verify: makeVerifyResult() }
        };

        expect(() => assertVerifyPipelineSucceeded(result, GENERATOR_NAME)).not.toThrow();
    });

    it("no-ops when verify.sh is absent (step skipped, pipeline still succeeded)", () => {
        // VerificationStep returns `skipped: true, success: true` when `.fern/verify.sh`
        // is missing, so the orchestrator leaves `pipelineResult.success === true`.
        // The helper must not throw — otherwise non-TS generators (no verify.sh today)
        // would fail seed CI as soon as we flipped them into the allow-list.
        const result: PipelineResult = {
            success: true,
            steps: { verify: makeVerifyResult({ skipped: true }) }
        };

        expect(() => assertVerifyPipelineSucceeded(result, GENERATOR_NAME)).not.toThrow();
    });

    it("throws an InternalError CliError with validator stderr when verify ran and failed", () => {
        const result: PipelineResult = {
            success: false,
            steps: {
                verify: makeVerifyResult({
                    success: false,
                    stderr: "tsc: src/index.ts(1,1): error TS1005: ';' expected."
                })
            },
            errors: ["tsc: src/index.ts(1,1): error TS1005: ';' expected."]
        };

        expect(() => assertVerifyPipelineSucceeded(result, GENERATOR_NAME)).toThrowError(CliError);

        try {
            assertVerifyPipelineSucceeded(result, GENERATOR_NAME);
        } catch (error) {
            expect(error).toBeInstanceOf(CliError);
            const cliError = error as CliError;
            expect(cliError.code).toBe(CliError.Code.InternalError);
            expect(cliError.message).toContain(GENERATOR_NAME);
            expect(cliError.message).toContain("error TS1005");
        }
    });

    it("throws when the pipeline failed before VerificationStep recorded a result", () => {
        // Models the validator-image-pull-failure / container-start-failure branch:
        // `VerificationStep.execute()` throws, the orchestrator catches and flips
        // `result.success = false` without ever assigning `result.steps.verify`.
        // Checking only `steps.verify.success` would silently no-op here — this test
        // pins down the harder failure mode the user called out.
        const result: PipelineResult = {
            success: false,
            steps: {},
            errors: ["verify step error: Unable to find image 'fernapi/fern-typescript-sdk-validator:latest' locally"]
        };

        expect(() => assertVerifyPipelineSucceeded(result, GENERATOR_NAME)).toThrowError(CliError);

        try {
            assertVerifyPipelineSucceeded(result, GENERATOR_NAME);
        } catch (error) {
            expect(error).toBeInstanceOf(CliError);
            const cliError = error as CliError;
            expect(cliError.code).toBe(CliError.Code.InternalError);
            expect(cliError.message).toContain("Unable to find image");
        }
    });

    it("falls back to errorMessage when no stderr and no pipeline-level errors are present", () => {
        const result: PipelineResult = {
            success: false,
            steps: {
                verify: makeVerifyResult({
                    success: false,
                    errorMessage: "non-zero exit code from validator container"
                })
            }
        };

        expect(() => assertVerifyPipelineSucceeded(result, GENERATOR_NAME)).toThrowError(
            /non-zero exit code from validator container/
        );
    });

    it("falls back to a generic message when no other detail is available", () => {
        const result: PipelineResult = {
            success: false,
            steps: {}
        };

        expect(() => assertVerifyPipelineSucceeded(result, GENERATOR_NAME)).toThrowError(
            /verification pipeline failed/
        );
    });

    it("prefers validator stderr over generic pipeline errors so the most actionable signal wins", () => {
        const result: PipelineResult = {
            success: false,
            steps: {
                verify: makeVerifyResult({
                    success: false,
                    stderr: "actionable validator stderr",
                    errorMessage: "less specific error message"
                })
            },
            errors: ["generic pipeline error"]
        };

        try {
            assertVerifyPipelineSucceeded(result, GENERATOR_NAME);
        } catch (error) {
            expect(error).toBeInstanceOf(CliError);
            const cliError = error as CliError;
            expect(cliError.message).toContain("actionable validator stderr");
            expect(cliError.message).not.toContain("generic pipeline error");
            expect(cliError.message).not.toContain("less specific error message");
        }
    });
});
