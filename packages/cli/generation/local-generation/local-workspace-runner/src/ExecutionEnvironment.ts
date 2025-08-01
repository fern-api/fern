import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

export declare namespace ExecutionEnvironment {
    interface ExecuteArgs {
        generatorName: string;
        irPath: AbsoluteFilePath;
        configPath: AbsoluteFilePath;
        outputPath: AbsoluteFilePath;
        snippetPath?: AbsoluteFilePath;
        snippetTemplatePath?: AbsoluteFilePath;
        context: TaskContext;
        inspect: boolean;
    }
}

export interface ExecutionEnvironment {
    execute(args: ExecutionEnvironment.ExecuteArgs): Promise<void>;
}
