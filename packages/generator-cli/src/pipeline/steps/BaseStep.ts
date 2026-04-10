import type { PipelineLogger } from "../PipelineLogger";
import type { PipelineContext, StepResult } from "../types";

export abstract class BaseStep {
    abstract readonly name: string;

    constructor(
        protected readonly outputDir: string,
        protected readonly logger: PipelineLogger
    ) {}

    abstract execute(context: PipelineContext): Promise<StepResult>;
}
