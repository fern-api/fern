import type { FernignoreStepResult, PipelineContext } from "../types";
import { BaseStep } from "./BaseStep";

/**
 * Step that preserves files listed in .fernignore during regeneration.
 * Phase 2: Not implemented yet - this is a placeholder.
 *
 * Will implement the git rm/reset/restore logic to preserve .fernignore paths.
 * Logic will be extracted from:
 * packages/cli/generation/local-generation/local-workspace-runner/src/LocalTaskHandler.ts
 */
export class FernignoreStep extends BaseStep {
    readonly name = "fernignore";

    async execute(_context: PipelineContext): Promise<FernignoreStepResult> {
        // TODO: Phase 2 - Implement fernignore preservation
        // - Read .fernignore file
        // - Parse glob patterns
        // - Execute git rm/reset/restore flow
        // - Return paths that were preserved
        throw new Error("FernignoreStep not implemented yet - Phase 2");
    }
}
