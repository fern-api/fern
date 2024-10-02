import { AbstractAPIWorkspace, FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

export declare namespace ConjureWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        context: TaskContext;
        relativePathToConjureDirectory: RelativeFilePath;
    }

    export interface Settings {}
}

export class ConjureWorkspace extends AbstractAPIWorkspace<ConjureWorkspace.Settings> {
    private absolutePathToConjureDefinition: AbsoluteFilePath;

    constructor({ relativePathToConjureDirectory, ...superArgs }: ConjureWorkspace.Args) {
        super(superArgs);
        this.absolutePathToConjureDefinition = join(superArgs.absoluteFilePath, relativePathToConjureDirectory);
    }

    public toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: ConjureWorkspace.Settings
    ): Promise<FernWorkspace> {
        throw new Error("Method not implemented.");
    }

    public getDefinition(
        { context }: { context?: TaskContext | undefined },
        settings?: ConjureWorkspace.Settings
    ): Promise<FernDefinition> {
        throw new Error("Method not implemented.");
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        throw new Error("Method not implemented.");
    }
}
