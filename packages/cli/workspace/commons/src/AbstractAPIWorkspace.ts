import { generatorsYml } from "@fern-api/configuration";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";

import { APIChangelog } from "./APIChangelog";
import { ParsedFernFile } from "./FernFile";
import { FernWorkspace } from "./FernWorkspace";

export interface FernDefinition {
    absoluteFilePath: AbsoluteFilePath;
    rootApiFile: ParsedFernFile<RootApiFileSchema>;
    namedDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    importedDefinitions: Record<RelativeFilePath, ImportedDefinition>;
}

export interface OnDiskNamedDefinitionFile extends ParsedFernFile<DefinitionFileSchema> {
    absoluteFilePath: AbsoluteFilePath;
}

export interface ImportedDefinition {
    url: string | undefined;
    definition: FernDefinition;
}

export declare namespace AbstractAPIWorkspace {
    interface Args {
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
        workspaceName: string | undefined;
        cliVersion: string;
        absoluteFilePath: AbsoluteFilePath;
        changelog?: APIChangelog;
    }

    export const Type = "api";
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
    public cliVersion: string;
    public absoluteFilePath: AbsoluteFilePath;
    public changelog: APIChangelog | undefined;

    public type = AbstractAPIWorkspace.Type;

    public constructor({
        generatorsConfiguration,
        workspaceName,
        cliVersion,
        absoluteFilePath,
        changelog
    }: AbstractAPIWorkspace.Args) {
        this.generatorsConfiguration = generatorsConfiguration;
        this.workspaceName = workspaceName;
        this.cliVersion = cliVersion;
        this.absoluteFilePath = absoluteFilePath;
        this.changelog = changelog;
    }

    public abstract toFernWorkspace({ context }: { context: TaskContext }, settings?: Settings): Promise<FernWorkspace>;

    /**
     * @returns The Fern Definition that corresponds to this workspace
     */
    public abstract getDefinition({ context }: { context?: TaskContext }, settings?: Settings): Promise<FernDefinition>;

    /**
     * @returns all filepaths related to this workspace
     */
    public abstract getAbsoluteFilePaths(): AbsoluteFilePath[];
}

/**
 * Equivalent to the `AbstractAPIWorkspace` class, but without async methods.
 * This is useful in environments that don't have access to async code.
 */
export abstract class AbstractAPIWorkspaceSync<Settings> {
    public generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    public workspaceName: string | undefined;
    public cliVersion: string;
    public absoluteFilePath: AbsoluteFilePath;
    public changelog: APIChangelog | undefined;

    public type = AbstractAPIWorkspace.Type;

    public constructor({
        generatorsConfiguration,
        workspaceName,
        cliVersion,
        absoluteFilePath,
        changelog
    }: AbstractAPIWorkspace.Args) {
        this.generatorsConfiguration = generatorsConfiguration;
        this.workspaceName = workspaceName;
        this.cliVersion = cliVersion;
        this.absoluteFilePath = absoluteFilePath;
        this.changelog = changelog;
    }

    public abstract toFernWorkspace({ context }: { context: TaskContext }, settings?: Settings): FernWorkspace;

    /**
     * @returns The Fern Definition that corresponds to this workspace
     */
    public abstract getDefinition({ context }: { context?: TaskContext }, settings?: Settings): FernDefinition;

    /**
     * @returns all filepaths related to this workspace
     */
    public abstract getAbsoluteFilePaths(): AbsoluteFilePath[];
}
