import type { PipelineResult } from "@fern-api/generator-cli/pipeline";
import { CliError } from "@fern-api/task-context";

/**
 * Throws a `CliError` when `PostGenerationPipeline` reports failure, exported so it
 * can be unit-tested without spinning up the real pipeline.
 *
 * `pipelineResult.success` is the canonical signal: it's `true` only when every step
 * (including `VerificationStep`) returned `success: true` and nothing threw. We key
 * off it instead of `pipelineResult.steps.verify.success` because the orchestrator
 * only populates `steps.verify` after the step returns cleanly — if the validator
 * image fails to pull or the container fails to start, the step throws, the
 * orchestrator catches and sets `success: false` without ever assigning
 * `steps.verify`. Checking only `steps.verify.success` would silently no-op in that
 * case and mask a real verify-pipeline failure in seed CI.
 *
 * Detail message preference: validator stderr (most actionable), then accumulated
 * pipeline errors (covers the thrown-before-result branch), then `errorMessage`,
 * then a generic fallback so the user always gets *something*.
 */
export function assertVerifyPipelineSucceeded(pipelineResult: PipelineResult, generatorName: string): void {
    if (pipelineResult.success) {
        return;
    }

    const verifyResult = pipelineResult.steps.verify;
    const errors = pipelineResult.errors ?? [];

    let detail: string;
    if (verifyResult?.stderr != null && verifyResult.stderr.length > 0) {
        detail = verifyResult.stderr;
    } else if (errors.length > 0) {
        detail = errors.join("\n");
    } else if (verifyResult?.errorMessage != null) {
        detail = verifyResult.errorMessage;
    } else {
        detail = "verification pipeline failed";
    }

    throw new CliError({
        message: `Verification failed for ${generatorName}: ${detail}`,
        code: CliError.Code.InternalError
    });
}
