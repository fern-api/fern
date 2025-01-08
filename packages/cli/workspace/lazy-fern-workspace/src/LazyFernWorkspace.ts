import hash from "object-hash";

import { AbstractAPIWorkspace, FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import {
    DEFINITION_DIRECTORY,
    dependenciesYml,
    generatorsYml,
    loadDependenciesConfiguration
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { OSSWorkspace } from "./OSSWorkspace";
import { handleFailedWorkspaceParserResultRaw } from "./utils/handleFailedWorkspaceParserResult";
import { listFernFiles } from "./utils/listFernFiles";
import { LoadAPIWorkspace } from "./utils/loadAPIWorkspace";
import { parseYamlFiles } from "./utils/parseYamlFiles";
import { processPackageMarkers } from "./utils/processPackageMarkers";
import { validateStructureOfYamlFiles } from "./utils/validateStructureOfYamlFiles";

export declare namespace LazyFernWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        context: TaskContext;
        loadAPIWorkspace?: LoadAPIWorkspace;
    }
}

export class LazyFernWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    private context: TaskContext;
    private fernWorkspaces: Record<string, FernWorkspace> = {};
    private loadAPIWorkspace?: LoadAPIWorkspace;

    constructor({ context, loadAPIWorkspace, ...superArgs }: LazyFernWorkspace.Args) {
        super(superArgs);
        this.context = context;
        this.loadAPIWorkspace = loadAPIWorkspace;
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
            const dependenciesConfiguration = await loadDependenciesConfiguration({
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
                settings,
                loadAPIWorkspace: this.loadAPIWorkspace
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
