import { DEFINITION_DIRECTORY, dependenciesYml, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import hash from "object-hash";
import { handleFailedWorkspaceParserResultRaw } from "../handleFailedWorkspaceParserResult";
import { listFernFiles } from "../listFernFiles";
import { parseYamlFiles } from "../parseYamlFiles";
import { processPackageMarkers } from "../processPackageMarkers";
import { validateStructureOfYamlFiles } from "../validateStructureOfYamlFiles";
import { OSSWorkspace } from "./OSSWorkspace";
import { FernWorkspace, AbstractAPIWorkspace, FernDefinition } from "@fern-api/api-workspace-commons";

export declare namespace LazyFernWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        context: TaskContext;
    }
}

export class LazyFernWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    private context: TaskContext;
    private fernWorkspaces: Record<string, FernWorkspace> = {};

    constructor({ context, ...superArgs }: LazyFernWorkspace.Args) {
        super(superArgs);
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
            const absolutePathToDefinition = join(this.absoluteFilePath, RelativeFilePath.of(DEFINITION_DIRECTORY));
            const dependenciesConfiguration = await dependenciesYml.loadDependenciesConfiguration({
                absolutePathToWorkspace: this.absoluteFilePath,
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
                absoluteFilePath: this.absoluteFilePath,
                generatorsConfiguration: this.generatorsConfiguration,
                dependenciesConfiguration,
                workspaceName: this.workspaceName,
                definition: {
                    absoluteFilePath: absolutePathToDefinition,
                    rootApiFile: structuralValidationResult.rootApiFile,
                    namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                    packageMarkers: processPackageMarkersResult.packageMarkers,
                    importedDefinitions: processPackageMarkersResult.importedDefinitions
                },
                cliVersion: this.cliVersion,
                sources: []
            });

            this.fernWorkspaces[key] = workspace;
        }

        return workspace;
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [this.absoluteFilePath];
    }
}
