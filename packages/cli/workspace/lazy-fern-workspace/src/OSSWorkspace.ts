import { FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration-loader";
import { isNonNullish } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { parse, ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { TaskContext } from "@fern-api/task-context";
import yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import { getAllOpenAPISpecs } from "./utils/getAllOpenAPISpecs";
import {
    FernWorkspace,
    AbstractAPIWorkspace,
    FernDefinition,
    IdentifiableSource
} from "@fern-api/api-workspace-commons";
import { OpenAPISettings, getOptionsOverridesFromSettings } from "@fern-api/browser-compatible-fern-workspace";
import { mapValues } from "./utils/mapValues";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { OpenAPILoader } from "./loaders/OpenAPILoader";

export type Spec = OpenAPISpec | ProtobufSpec;

export interface OpenAPISpec {
    type: "openapi";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    source: Source;
    namespace?: string;
    settings?: SpecImportSettings;
}

export interface ProtobufSpec {
    type: "protobuf";
    absoluteFilepathToProtobufRoot: AbsoluteFilePath;
    absoluteFilepathToProtobufTarget: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    generateLocally: boolean;
    settings?: SpecImportSettings;
}

export type Source = AsyncAPISource | OpenAPISource | ProtobufSource;

export interface AsyncAPISource {
    type: "asyncapi";
    relativePathToDependency?: RelativeFilePath;
    file: AbsoluteFilePath;
}

export interface OpenAPISource {
    type: "openapi";
    relativePathToDependency?: RelativeFilePath;
    file: AbsoluteFilePath;
}

export interface ProtobufSource {
    type: "protobuf";
    relativePathToDependency?: RelativeFilePath;
    root: AbsoluteFilePath;
    file: AbsoluteFilePath;
}

export interface SpecImportSettings {
    audiences: string[];
    shouldUseTitleAsName: boolean;
    shouldUseUndiscriminatedUnionsWithLiterals: boolean;
    optionalAdditionalProperties: boolean;
    asyncApiNaming?: "v1" | "v2";
    cooerceEnumsToLiterals: boolean;
    objectQueryParameters: boolean;
    respectReadonlySchemas: boolean;
    onlyIncludeReferencedSchemas: boolean;
    inlinePathParameters: boolean;
}

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        workspaceName: string | undefined;
        specs: Spec[];
        cliVersion: string;
    }

    export type Settings = OpenAPISettings;
}

export class OSSWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    public specs: Spec[];
    public sources: IdentifiableSource[];

    private loader: OpenAPILoader;
    private respectReadonlySchemas: boolean;
    private onlyIncludeReferencedSchemas: boolean;
    private inlinePathParameters: boolean;

    constructor({ specs, ...superArgs }: OSSWorkspace.Args) {
        super(superArgs);
        this.specs = specs;
        this.sources = this.convertSpecsToIdentifiableSources(specs);
        this.loader = new OpenAPILoader(this.absoluteFilePath);
        this.respectReadonlySchemas = this.specs.every((spec) => spec.settings?.respectReadonlySchemas ?? false);
        this.onlyIncludeReferencedSchemas = this.specs.every(
            (spec) => spec.settings?.onlyIncludeReferencedSchemas ?? false
        );
        this.inlinePathParameters = this.specs.every((spec) => spec.settings?.inlinePathParameters ?? false);
    }

    public async getOpenAPIIr(
        {
            context,
            relativePathToDependency
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: OSSWorkspace.Settings
    ): Promise<OpenApiIntermediateRepresentation> {
        const openApiSpecs = await getAllOpenAPISpecs({ context, specs: this.specs, relativePathToDependency });
        const optionOverrides = getOptionsOverridesFromSettings(settings);
        return await parse({
            context,
            documents: await this.loader.loadDocuments({
                context,
                specs: openApiSpecs
            }),
            options: {
                ...optionOverrides,
                respectReadonlySchemas: this.respectReadonlySchemas,
                onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas
            }
        });
    }

    public async getDefinition(
        {
            context,
            relativePathToDependency
        }: {
            context: TaskContext;
            relativePathToDependency?: RelativeFilePath;
        },
        settings?: OSSWorkspace.Settings
    ): Promise<FernDefinition> {
        const openApiIr = await this.getOpenAPIIr({ context, relativePathToDependency }, settings);

        // Ideally you are still at the individual spec level here, so you can still modify the fern definition
        // file paths with the inputted namespace, however given auth and other shared settings I think we have to
        // resolve to the IR first, and namespace there.
        const objectQueryParameters = this.specs.every((spec) => spec.settings?.objectQueryParameters);
        const definition = convert({
            authOverrides:
                this.generatorsConfiguration?.api?.auth != null ? { ...this.generatorsConfiguration?.api } : undefined,
            environmentOverrides:
                this.generatorsConfiguration?.api?.environments != null
                    ? { ...this.generatorsConfiguration?.api }
                    : undefined,
            globalHeaderOverrides:
                this.generatorsConfiguration?.api?.headers != null
                    ? { ...this.generatorsConfiguration?.api }
                    : undefined,
            taskContext: context,
            ir: openApiIr,
            enableUniqueErrorsPerEndpoint: settings?.enableUniqueErrorsPerEndpoint ?? false,
            detectGlobalHeaders: settings?.detectGlobalHeaders ?? true,
            objectQueryParameters,
            respectReadonlySchemas: this.respectReadonlySchemas,
            onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas,
            inlinePathParameters: this.inlinePathParameters
        });

        return {
            // these files doesn't live on disk, so there's no absolute filepath
            absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH"),
            rootApiFile: {
                defaultUrl: definition.rootApiFile["default-url"],
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    // these files doesn't live on disk, so there's no absolute filepath
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    // these files doesn't live on disk, so there's no absolute filepath
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definition.packageMarkerFile),
                    contents: definition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        };
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: OSSWorkspace.Settings
    ): Promise<FernWorkspace> {
        const definition = await this.getDefinition({ context }, settings);
        return new FernWorkspace({
            absoluteFilePath: this.absoluteFilePath,
            workspaceName: this.workspaceName,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration: {
                dependencies: {}
            },
            definition,
            cliVersion: this.cliVersion,
            sources: this.sources
        });
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [
            this.absoluteFilePath,
            ...this.specs
                .flatMap((spec) => [
                    spec.type === "protobuf" ? spec.absoluteFilepathToProtobufTarget : spec.absoluteFilepath,
                    spec.absoluteFilepathToOverrides
                ])
                .filter(isNonNullish)
        ];
    }

    public getSources(): IdentifiableSource[] {
        return this.sources;
    }

    private convertSpecsToIdentifiableSources(specs: Spec[]): IdentifiableSource[] {
        const seen = new Set<string>();
        const result: IdentifiableSource[] = [];
        return specs.reduce((acc, spec) => {
            const absoluteFilePath =
                spec.type === "protobuf" ? spec.absoluteFilepathToProtobufRoot : spec.absoluteFilepath;

            if (!seen.has(absoluteFilePath)) {
                seen.add(absoluteFilePath);
                acc.push({
                    type: spec.type,
                    id: uuidv4(),
                    absoluteFilePath
                });
            }

            return acc;
        }, result);
    }
}

export function getOSSWorkspaceSettingsFromGeneratorInvocation(
    generatorInvocation: generatorsYml.GeneratorInvocation
): OSSWorkspace.Settings | undefined {
    if (generatorInvocation.settings == null) {
        return undefined;
    }
    const result: OSSWorkspace.Settings = {
        detectGlobalHeaders: true
    };
    if (generatorInvocation.settings.unions === "v1") {
        result.enableDiscriminatedUnionV2 = true;
    }

    return result;
}
