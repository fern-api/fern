import type { PipelineLogger } from "../PipelineLogger";
import type { PipelineContext, StepResult } from "../types";

export abstract class BaseStep {
    public abstract readonly name: string;

    public constructor(
        protected readonly outputDir: string,
        protected readonly logger: PipelineLogger
    ) {}

    public abstract execute(context: PipelineContext): Promise<StepResult>;
}
