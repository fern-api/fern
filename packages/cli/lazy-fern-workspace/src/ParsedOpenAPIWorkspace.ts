import { AbstractAPIWorkspace, FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import { OSSWorkspace, SpecImportSettings } from "./OSSWorkspace";
import { OpenAPI } from "openapi-types";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { ParseOpenAPIOptions, parseOpenAPISpecs } from "@fern-api/openapi-ir-parser";
import { mapValues } from "./utils/mapValues";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import yaml from "js-yaml";

export interface ParsedOpenAPISpec {
    type: "openapi";
    parsed: OpenAPI.Document;
    overrides?: OpenAPI.Document;
    namespace?: string;
    settings?: SpecImportSettings;
}

export declare namespace ParsedOpenAPIWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        specs: ParsedOpenAPISpec[];
    }

    // TODO: Move this to a shared location.
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
        /*
         * Whether or not to parse object query parameters.
         */
        objectQueryParameters?: boolean;
        /*
         * Whether or not to preserve original schema ids.
         */
        preserveSchemaIds?: boolean;
    }
}

export class ParsedOpenAPIWorkspace extends AbstractAPIWorkspace<ParsedOpenAPIWorkspace.Settings> {
    public specs: ParsedOpenAPISpec[];

    private respectReadonlySchemas: boolean;
    private onlyIncludeReferencedSchemas: boolean;
    private inlinePathParameters: boolean;

    constructor({ specs, ...superArgs }: ParsedOpenAPIWorkspace.Args) {
        super(superArgs);
        this.specs = specs;
        this.respectReadonlySchemas = this.specs.every((spec) => spec.settings?.respectReadonlySchemas ?? false);
        this.onlyIncludeReferencedSchemas = this.specs.every(
            (spec) => spec.settings?.onlyIncludeReferencedSchemas ?? false
        );
        this.inlinePathParameters = this.specs.every((spec) => spec.settings?.inlinePathParameters ?? false);
    }

    public async getDefinition({
        context,
        settings
    }: {
        context: TaskContext;
        settings?: OSSWorkspace.Settings;
    }): Promise<FernDefinition> {
        const openApiIr = await this.getOpenAPIIr({ context, settings });

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
            // These files are held in-memory, so there's no absolute filepath.
            absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH"),
            rootApiFile: {
                defaultUrl: definition.rootApiFile["default-url"],
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    absoluteFilepath: AbsoluteFilePath.of("/DUMMY_PATH"),
                    rawContents: yaml.dump(definition.packageMarkerFile),
                    contents: definition.packageMarkerFile
                }
            },
            packageMarkers: {},
            importedDefinitions: {}
        };
    }

    public async getOpenAPIIr({
        context,
        settings
    }: {
        context: TaskContext;
        settings?: ParsedOpenAPIWorkspace.Settings;
    }): Promise<OpenApiIntermediateRepresentation> {
        const optionOverrides = getOptionsOverridesFromSettings(settings);
        return await parseOpenAPISpecs({
            specs: this.specs,
            taskContext: context,
            optionOverrides: {
                ...optionOverrides,
                respectReadonlySchemas: this.respectReadonlySchemas,
                onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas
            }
        });
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: OSSWorkspace.Settings
    ): Promise<FernWorkspace> {
        const definition = await this.getDefinition({ context, settings });
        return new FernWorkspace({
            absoluteFilePath: this.absoluteFilePath,
            workspaceName: this.workspaceName,
            generatorsConfiguration: this.generatorsConfiguration,
            dependenciesConfiguration: {
                dependencies: {}
            },
            definition,
            cliVersion: this.cliVersion
        });
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [];
    }
}

// TODO: Move this to a shared location.
function getOptionsOverridesFromSettings(
    settings?: ParsedOpenAPIWorkspace.Settings
): Partial<ParseOpenAPIOptions> | undefined {
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
    if (settings.preserveSchemaIds) {
        result.preserveSchemaIds = true;
    }
    return result;
}
