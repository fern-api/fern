import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces";
import { Semaphore } from "../../../Semaphore";

export declare namespace ScriptRunner {
    interface RunArgs {
        taskContext: TaskContext;
        outputDir: AbsoluteFilePath;
        id: string;
        skipScripts?: string[];
    }

    type RunResponse = ScriptSuccessResponse | ScriptFailureResponse;

    interface ScriptSuccessResponse {
        type: "success";
    }

    interface ScriptFailureResponse {
        type: "failure";
        message: string;
    }
}

/**
 * Abstract base class for running scripts on generated code to verify the output.
 */
export abstract class ScriptRunner {
    protected readonly lock = new Semaphore(1);

    constructor(
        protected readonly workspace: GeneratorWorkspace,
        protected readonly skipScripts: boolean,
        protected readonly context: TaskContext,
        protected readonly logLevel: LogLevel
    ) {}

    public abstract run({ taskContext, id, outputDir }: ScriptRunner.RunArgs): Promise<ScriptRunner.RunResponse>;
    public abstract stop(): Promise<void>;

    protected abstract initialize(): Promise<void>;

    protected shouldStreamOutput(): boolean {
        return this.logLevel === "debug" || this.logLevel === "trace";
    }
}
