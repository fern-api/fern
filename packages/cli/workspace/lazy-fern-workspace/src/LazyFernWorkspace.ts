import { AbstractAPIWorkspace, FernDefinition, FernWorkspace, type Spec } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { DEFINITION_DIRECTORY, loadDependenciesConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import hash from "object-hash";

import { OSSWorkspace } from "./OSSWorkspace.js";
import { handleFailedWorkspaceParserResultRaw } from "./utils/handleFailedWorkspaceParserResult.js";
import { listFernFiles } from "./utils/listFernFiles.js";
import { LoadAPIWorkspace } from "./utils/loadAPIWorkspace.js";
import { parseYamlFiles } from "./utils/parseYamlFiles.js";
import { processPackageMarkers } from "./utils/processPackageMarkers.js";
import { validateStructureOfYamlFiles } from "./utils/validateStructureOfYamlFiles.js";

export declare namespace LazyFernWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        context: TaskContext;
        loadAPIWorkspace?: LoadAPIWorkspace;
    }
}

export class LazyFernWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    public type: string = "fern";
    private context: TaskContext;
    public allSpecs: Spec[] = [];
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
        const defaultedContext = context || this.context;
        return (await this.toFernWorkspace({ context: defaultedContext }, settings)).definition;
    }

    public async toFernWorkspace(
        { context, skipValidation }: { context?: TaskContext; skipValidation?: boolean },
        settings?: OSSWorkspace.Settings,
        specsOverride?: generatorsYml.ApiConfigurationV2SpecsSchema,
        generatorOverrides?: generatorsYml.OverridesSchema
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
                return defaultedContext.failAndThrow(undefined, undefined, {
                    code: CliError.Code.ValidationError
                });
            }

            const structuralValidationResult = validateStructureOfYamlFiles({
                files: parseResult.files,
                absolutePathToDefinition,
                skipValidation
            });
            if (!structuralValidationResult.didSucceed) {
                handleFailedWorkspaceParserResultRaw(structuralValidationResult.failures, defaultedContext.logger);
                return defaultedContext.failAndThrow(undefined, undefined, {
                    code: CliError.Code.ValidationError
                });
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
                return defaultedContext.failAndThrow(undefined, undefined, {
                    code: CliError.Code.ValidationError
                });
            }

            let definition = {
                absoluteFilePath: absolutePathToDefinition,
                rootApiFile: structuralValidationResult.rootApiFile,
                namedDefinitionFiles: structuralValidationResult.namedDefinitionFiles,
                packageMarkers: processPackageMarkersResult.packageMarkers,
                importedDefinitions: processPackageMarkersResult.importedDefinitions
            };
            if (settings?.auth != null) {
                definition = {
                    ...definition,
                    rootApiFile: {
                        ...definition.rootApiFile,
                        contents: {
                            ...definition.rootApiFile.contents,
                            auth: settings?.auth
                        }
                    }
                };
            }

            workspace = new FernWorkspace({
                absoluteFilePath: this.absoluteFilePath,
                generatorsConfiguration: this.generatorsConfiguration,
                dependenciesConfiguration,
                workspaceName: this.workspaceName,
                definition,
                cliVersion: this.cliVersion,
                sources: processPackageMarkersResult.sources
            });

            this.fernWorkspaces[key] = workspace;
            this.allSpecs = processPackageMarkersResult.specs;
        }

        return workspace;
    }

    public async getSourceSpecs(): Promise<Spec[]> {
        await this.toFernWorkspace({ context: this.context });
        const specs = this.allSpecs;
        if (specs.length === 0) {
            throw new CliError({
                message: `Workspace ${this.workspaceName ?? this.absoluteFilePath} composes no spec-bearing dependencies, so it exposes no source specs`,
                code: CliError.Code.ResolutionError
            });
        }
        return specs;
    }

    public async getAllSpecsForGenerator(
        specsOverride: generatorsYml.ApiConfigurationV2SpecsSchema | undefined
    ): Promise<Spec[]> {
        if (specsOverride != null) {
            throw new CliError({
                message: `Workspace ${this.workspaceName ?? this.absoluteFilePath} composes its specs through dependencies.yml, which cannot be combined with a generator-level specs override`,
                code: CliError.Code.ConfigError
            });
        }
        return this.getSourceSpecs();
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [this.absoluteFilePath];
    }
}
