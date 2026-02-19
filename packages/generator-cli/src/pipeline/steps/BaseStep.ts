import type { PipelineLogger } from "../PipelineLogger";
import type { PipelineContext, StepResult } from "../types";

/**
 * Abstract base class for pipeline steps.
 * Each step must implement execute() to perform its operation.
 */
export abstract class BaseStep {
    /**
     * The name of this step (e.g., "replay", "fernignore", "github").
     * Used for logging and result tracking.
     */
    abstract readonly name: string;

    /**
     * @param outputDir - The directory containing the generated SDK code
     * @param logger - Logger for step diagnostics
     */
    constructor(
        protected readonly outputDir: string,
        protected readonly logger: PipelineLogger
    ) {}

    /**
     * Execute this step's operation.
     * @param context - Accumulated results from previous pipeline steps
     * @returns A promise that resolves to the step result
     */
    abstract execute(context: PipelineContext): Promise<StepResult>;
}
