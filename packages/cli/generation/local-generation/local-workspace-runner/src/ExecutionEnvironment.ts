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
    }

    interface SupportsMultiSpecArgs {
        context: TaskContext;
        runner: ContainerRunner | undefined;
    }
}

export interface ExecutionEnvironment {
    /** Whether this environment runs inside a container and needs container-internal paths in the generator config. */
    readonly usesContainerPaths: boolean;
    execute(args: ExecutionEnvironment.ExecuteArgs): Promise<void>;
    /**
     * Whether whatever this environment will run generates from every spec it is handed, rather than
     * from the first one.
     *
     * Optional, and an environment that does not implement it is read as "no". Only the container
     * route can answer -- the answer is a property of the image, which is why it is asked of the
     * environment that holds the image reference rather than derived from the generator's version.
     */
    supportsMultiSpec?(args: ExecutionEnvironment.SupportsMultiSpecArgs): Promise<boolean>;
}
