import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

export interface SourceMount {
    hostPath: AbsoluteFilePath;
    containerPath: string;
}

export declare namespace ExecutionEnvironment {
    interface ExecuteArgs {
        generatorName: string;
        irPath: AbsoluteFilePath;
        configPath: AbsoluteFilePath;
        outputPath: AbsoluteFilePath;
        snippetPath?: AbsoluteFilePath;
        snippetTemplatePath?: AbsoluteFilePath;
        licenseFilePath?: AbsoluteFilePath;
        sourceMounts?: SourceMount[];
        context: TaskContext;
        inspect: boolean;
        runner: ContainerRunner | undefined;
        /** Whether to use a Docker volume for /fern/output for faster I/O during local generation */
        useDockerVolume?: boolean;
    }
}

export interface ExecutionEnvironment {
    /** Whether this environment runs inside a container and needs container-internal paths in the generator config. */
    readonly usesContainerPaths: boolean;
    execute(args: ExecutionEnvironment.ExecuteArgs): Promise<void>;
}
