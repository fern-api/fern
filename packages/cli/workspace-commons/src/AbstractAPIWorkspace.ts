import { TaskContext } from "@fern-api/task-context";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { ParsedFernFile } from "./FernFile";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { FernWorkspace } from "./FernWorkspace";

export interface FernDefinition {
    absoluteFilepath: AbsoluteFilePath;
    rootApiFile: ParsedFernFile<RootApiFileSchema>;
    namedDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    importedDefinitions: Record<RelativeFilePath, ImportedDefinition>;
}

export interface OnDiskNamedDefinitionFile extends ParsedFernFile<DefinitionFileSchema> {
    absoluteFilepath: AbsoluteFilePath;
}

export interface ImportedDefinition {
    url: string | undefined;
    definition: FernDefinition;
}

export declare namespace AbstractAPIWorkspace {
    interface Args {
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
        workspaceName: string | undefined;
    }
}

/**
 * Represents an arbitrary API Definition within the Fern folder. Each API Definition
 * will eventually have a set of canonical operations such as `validate`, `lint`, etc.
 *
 * Each API Definition will also be able to convert themselves into a `FernWorkspace`
 * to be interoperable with the rest of the codebase.
 */
export abstract class AbstractAPIWorkspace<Settings> {
    public generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    public workspaceName: string | undefined;

    public type = "api";

    public constructor({ generatorsConfiguration, workspaceName }: AbstractAPIWorkspace.Args) {
        this.generatorsConfiguration = generatorsConfiguration;
        this.workspaceName = workspaceName;
    }

    public abstract toFernWorkspace({ context }: { context: TaskContext }, settings?: Settings): Promise<FernWorkspace>;

    /**
     * @returns The Fern Definition that corresponds to this workspace
     */
    public abstract getDefinition({ context }: { context?: TaskContext }, settings?: Settings): Promise<FernDefinition>;

    /**
     * @returns all filepaths related to this workspace
     */
    public abstract getAbsoluteFilepaths(): AbsoluteFilePath[];
}
