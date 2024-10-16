import { FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration";
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
import { mapValues } from "./utils/mapValues";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";

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
}

export declare namespace OSSWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        workspaceName: string | undefined;
        specs: Spec[];
        cliVersion: string;
    }

    export interface Settings {
        /*
         * Whether or not to parse unique errors for OpenAPI operation. This is
         * an option that is typically enabled for docs generation.
         */
        enableUniqueErrorsPerEndpoint?: boolean;
        /*
         * Whether or not to parse discriminated unions as undiscriminated unions with literals.
         * Typically enabled for duck typed languages like Python / TypeScript.
         */
        enableDiscriminatedUnionV2?: boolean;
        /*
         * Whether or not to extract frequently used headers out of the endpoints into a
         * global header. This is primarily used for generating SDKs, but disabled for docs
         * as it allows the documentation to more closely mirror the OpenAPI spec.
         */
        detectGlobalHeaders?: boolean;
        /*
         * Whether or not to let additional property values in OpenAPI come through as
         * optional.
         */
        optionalAdditionalProperties?: boolean;
        /*
         * Whether or not to cooerce enums to undiscriminated union literals.
         */
        cooerceEnumsToLiterals?: boolean;
    }
}

export class OSSWorkspace extends AbstractAPIWorkspace<OSSWorkspace.Settings> {
    public specs: Spec[];
    public sources: IdentifiableSource[];

    constructor({ specs, ...superArgs }: OSSWorkspace.Args) {
        super(superArgs);
        this.specs = specs;
        this.sources = this.convertSpecsToIdentifiableSources(specs);
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
        return await parse({
            absoluteFilePathToWorkspace: this.absoluteFilePath,
            specs: openApiSpecs,
            taskContext: context,
            optionOverrides: getOptionsOverridesFromSettings(settings)
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

        context.logger.info(
            "this.generatorsConfiguration?.apiWideSettings?.shouldInlineTypes",
            `${this.generatorsConfiguration?.apiWideSettings?.shouldInlineTypes}`
        );
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
            shouldInlineTypes: this.generatorsConfiguration?.apiWideSettings?.shouldInlineTypes ?? false
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

function getOptionsOverridesFromSettings(settings?: OSSWorkspace.Settings): Partial<ParseOpenAPIOptions> | undefined {
    if (settings == null) {
        return undefined;
    }
    const result: Partial<ParseOpenAPIOptions> = {};
    if (settings.enableDiscriminatedUnionV2) {
        result.discriminatedUnionV2 = true;
    }
    if (settings.optionalAdditionalProperties) {
        result.optionalAdditionalProperties = true;
    }
    if (settings.cooerceEnumsToLiterals) {
        result.cooerceEnumsToLiterals = true;
    }
    return result;
}
