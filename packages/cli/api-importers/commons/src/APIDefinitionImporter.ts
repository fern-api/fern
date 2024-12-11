import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";

export declare namespace APIDefinitionImporter {
    interface Return {
        rootApiFile: RootApiFileSchema;
        packageMarkerFile: PackageMarkerFileSchema;
        definitionFiles: Record<RelativeFilePath, DefinitionFileSchema>;
    }
}

export abstract class APIDefinitionImporter<T> {
    public constructor(protected readonly context?: TaskContext) {}

    public abstract import(input: T): Promise<APIDefinitionImporter.Return>;
}
