import { DEFINITION_DIRECTORY, dependenciesYml, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import hash from "object-hash";
import { handleFailedWorkspaceParserResultRaw } from "../handleFailedWorkspaceParserResult";
import { listFernFiles } from "../listFernFiles";
import { parseYamlFiles } from "../parseYamlFiles";
import { processPackageMarkers } from "../processPackageMarkers";
import { APIChangelog } from "../types/Workspace";
import { validateStructureOfYamlFiles } from "../validateStructureOfYamlFiles";
import { OSSWorkspace } from "./OSSWorkspace";
import { FernWorkspace, AbstractAPIWorkspace, FernDefinition } from "@fern-api/api-workspace-commons";

export declare namespace LazyFernWorkspace {
    export interface BaseArgs {
        absoluteFilepath: AbsoluteFilePath;
        changelog: APIChangelog | undefined;
    }

    export interface Args extends BaseArgs, AbstractAPIWorkspace.Args {
        context: TaskContext;
        cliVersion: string;
    }
}

export class LazyFernWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    public absoluteFilepath: AbsoluteFilePath;
    public changelog: APIChangelog | undefined;

    private context: TaskContext;
    private cliVersion: string;
    private fernWorkspaces: Record<string, FernWorkspace> = {};

    constructor({ absoluteFilepath, changelog, cliVersion, context, ...superArgs }: LazyFernWorkspace.Args) {
        super(superArgs);
        this.absoluteFilepath = absoluteFilepath;
        this.changelog = changelog;
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
        const key = hash(settings ?? {});
        let workspace = this.fernWorkspaces[key];

        if (workspace == null) {
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

            workspace = new FernWorkspace({
                absoluteFilePath: this.absoluteFilepath,
                generatorsConfiguration: this.generatorsConfiguration,
                dependenciesConfiguration,
                workspaceName: this.workspaceName,
                definition: {
                    absoluteFilepath: absolutePathToDefinition,
                    rootApiFile: structuralValidationResult.rootApiFile,
                    namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                    packageMarkers: processPackageMarkersResult.packageMarkers,
                    importedDefinitions: processPackageMarkersResult.importedDefinitions
                }
            });

            this.fernWorkspaces[key] = workspace;
        }

        return workspace;
    }

    public getAbsoluteFilepaths(): AbsoluteFilePath[] {
        return [this.absoluteFilepath];
    }
}
