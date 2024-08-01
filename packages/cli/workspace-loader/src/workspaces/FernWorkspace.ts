import { DEFINITION_DIRECTORY, dependenciesYml, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { handleFailedWorkspaceParserResultRaw } from "../handleFailedWorkspaceParserResult";
import { listFernFiles } from "../listFernFiles";
import { parseYamlFiles } from "../parseYamlFiles";
import { processPackageMarkers } from "../processPackageMarkers";
import { APIChangelog, FernDefinition } from "../types/Workspace";
import { validateStructureOfYamlFiles } from "../validateStructureOfYamlFiles";
import { AbstractAPIWorkspace } from "./AbstractAPIWorkspace";
import { OSSWorkspace } from "./OSSWorkspace";

export declare namespace FernWorkspace {
    export interface Args extends LazyFernWorkspace.BaseArgs {
        dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
        definition: FernDefinition;
    }
}

export class FernWorkspace extends AbstractAPIWorkspace<void> {
    public type: "fern" | "oss" = "fern";
    public workspaceName: string | undefined;
    public absoluteFilepath: AbsoluteFilePath;
    public generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    public dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    public definition: FernDefinition;
    public changelog: APIChangelog | undefined;

    constructor({
        absoluteFilepath,
        workspaceName,
        generatorsConfiguration,
        dependenciesConfiguration,
        definition,
        changelog
    }: FernWorkspace.Args) {
        super();
        this.absoluteFilepath = absoluteFilepath;
        this.workspaceName = workspaceName;
        this.changelog = changelog;
        this.generatorsConfiguration = generatorsConfiguration;
        this.dependenciesConfiguration = dependenciesConfiguration;
        this.definition = definition;
    }

    public async getDefinition(): Promise<FernDefinition> {
        return this.definition;
    }

    public async toFernWorkspace(): Promise<FernWorkspace> {
        return this;
    }
}

export declare namespace LazyFernWorkspace {
    export interface BaseArgs {
        workspaceName: string | undefined;
        absoluteFilepath: AbsoluteFilePath;
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
        changelog: APIChangelog | undefined;
    }

    export interface Args extends BaseArgs {
        context: TaskContext;
        cliVersion: string;
    }
}

export class LazyFernWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    public type: "fern" | "oss" = "fern";
    public workspaceName: string | undefined;
    public absoluteFilepath: AbsoluteFilePath;
    public generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    public changelog: APIChangelog | undefined;

    private context: TaskContext;
    private cliVersion: string;
    private downloaded = false;

    constructor({
        absoluteFilepath,
        workspaceName,
        generatorsConfiguration,
        changelog,
        cliVersion,
        context
    }: LazyFernWorkspace.Args) {
        super();
        this.absoluteFilepath = absoluteFilepath;
        this.workspaceName = workspaceName;
        this.changelog = changelog;
        this.generatorsConfiguration = generatorsConfiguration;
        this.cliVersion = cliVersion;
        this.context = context;
    }

    public async getDefinition(
        { context }: { context?: TaskContext },
        settings?: OSSWorkspace.Settings
    ): Promise<FernDefinition> {
        return (await this.toFernWorkspace({ context }, settings)).definition;
    }

    public async toFernWorkspace(
        { context }: { context?: TaskContext },
        settings?: OSSWorkspace.Settings
    ): Promise<FernWorkspace> {
        if (this.downloaded) {
            context?.logger.disable();
        }

        const defaultedContext = context || this.context;
        const absolutePathToDefinition = join(this.absoluteFilepath, RelativeFilePath.of(DEFINITION_DIRECTORY));
        const dependenciesConfiguration = await dependenciesYml.loadDependenciesConfiguration({
            absolutePathToWorkspace: this.absoluteFilepath,
            context: defaultedContext
        });

        const yamlFiles = await listFernFiles(absolutePathToDefinition, "{yml,yaml}");

        const parseResult = await parseYamlFiles(yamlFiles);
        if (!parseResult.didSucceed) {
            handleFailedWorkspaceParserResultRaw(parseResult.failures, defaultedContext.logger);
            return defaultedContext.failAndThrow();
        }

        const structuralValidationResult = validateStructureOfYamlFiles({
            files: parseResult.files,
            absolutePathToDefinition
        });
        if (!structuralValidationResult.didSucceed) {
            handleFailedWorkspaceParserResultRaw(structuralValidationResult.failures, defaultedContext.logger);
            return defaultedContext.failAndThrow();
        }

        const processPackageMarkersResult = await processPackageMarkers({
            dependenciesConfiguration,
            structuralValidationResult,
            context: defaultedContext,
            cliVersion: this.cliVersion,
            settings
        });
        if (!processPackageMarkersResult.didSucceed) {
            handleFailedWorkspaceParserResultRaw(processPackageMarkersResult.failures, defaultedContext.logger);
            return defaultedContext.failAndThrow();
        }

        if (!this.downloaded) {
            this.downloaded = true;
        } else {
            context?.logger.enable();
        }

        return new FernWorkspace({
            absoluteFilepath: this.absoluteFilepath,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration,
            workspaceName: this.workspaceName,
            definition: {
                absoluteFilepath: absolutePathToDefinition,
                rootApiFile: structuralValidationResult.rootApiFile,
                namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                packageMarkers: processPackageMarkersResult.packageMarkers,
                importedDefinitions: processPackageMarkersResult.importedDefinitions
            },
            changelog: this.changelog
        });
    }
}
