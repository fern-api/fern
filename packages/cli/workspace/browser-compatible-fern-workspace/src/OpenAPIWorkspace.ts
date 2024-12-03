import { AbstractAPIWorkspace, FernDefinition, FernWorkspace } from "@fern-api/api-workspace-commons";
import { SpecImportSettings } from "@fern-api/openapi-ir-parser";
import { OpenAPI } from "openapi-types";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { mapValues } from "lodash-es";
import { convert } from "@fern-api/openapi-ir-to-fern";
import { FERN_PACKAGE_MARKER_FILENAME, generatorsYml } from "@fern-api/configuration";
import { InMemoryOpenAPILoader } from "./InMemoryOpenAPILoader";
import { OpenAPISettings } from "./OpenAPISettings";
import { getOptionsOverridesFromSettings } from "./getOptionsOverridesFromSettings";
import yaml from "js-yaml";

const IN_MEMORY_ABSOLUTE_FILEPATH = AbsoluteFilePath.of("/<memory>");

const DEFAULT_WORKSPACE_ARGS = {
    absoluteFilePath: IN_MEMORY_ABSOLUTE_FILEPATH,
    cliVersion: "<unknown>",
    workspaceName: "anonymous"
};

export declare namespace OpenAPIWorkspace {
    export interface Args {
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
        spec: Spec;
    }

    export interface Spec {
        parsed: OpenAPI.Document;
        overrides?: OpenAPI.Document;
        settings?: SpecImportSettings;
    }

    export type Settings = OpenAPISettings;
}

export class OpenAPIWorkspace extends AbstractAPIWorkspace<OpenAPIWorkspace.Settings> {
    public spec: OpenAPIWorkspace.Spec;

    private loader: InMemoryOpenAPILoader;
    private respectReadonlySchemas: boolean;
    private onlyIncludeReferencedSchemas: boolean;
    private inlinePathParameters: boolean;

    constructor({ spec, generatorsConfiguration }: OpenAPIWorkspace.Args) {
        super({
            ...DEFAULT_WORKSPACE_ARGS,
            generatorsConfiguration
        });
        this.spec = spec;
        this.loader = new InMemoryOpenAPILoader();
        this.respectReadonlySchemas = spec.settings?.respectReadonlySchemas ?? false;
        this.onlyIncludeReferencedSchemas = spec.settings?.onlyIncludeReferencedSchemas ?? false;
        this.inlinePathParameters = spec.settings?.inlinePathParameters ?? false;
    }

    public async getDefinition({
        context,
        settings
    }: {
        context: TaskContext;
        settings?: OpenAPIWorkspace.Settings;
    }): Promise<FernDefinition> {
        const openApiIr = await this.getOpenAPIIr({ context, settings });
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
            objectQueryParameters: this.spec.settings?.objectQueryParameters ?? false,
            respectReadonlySchemas: this.respectReadonlySchemas,
            onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas,
            inlinePathParameters: this.inlinePathParameters
        });

        return {
            absoluteFilePath: IN_MEMORY_ABSOLUTE_FILEPATH,
            rootApiFile: {
                defaultUrl: definition.rootApiFile["default-url"],
                contents: definition.rootApiFile,
                rawContents: yaml.dump(definition.rootApiFile)
            },
            namedDefinitionFiles: {
                ...mapValues(definition.definitionFiles, (definitionFile) => ({
                    absoluteFilepath: IN_MEMORY_ABSOLUTE_FILEPATH,
                    rawContents: yaml.dump(definitionFile),
                    contents: definitionFile
                })),
                [RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)]: {
                    absoluteFilepath: IN_MEMORY_ABSOLUTE_FILEPATH,
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
        settings?: OpenAPIWorkspace.Settings;
    }): Promise<OpenApiIntermediateRepresentation> {
        const optionOverrides = getOptionsOverridesFromSettings(settings);
        const document = await this.loader.loadDocument(this.spec);
        return await parse({
            context,
            documents: [document],
            options: {
                ...optionOverrides,
                respectReadonlySchemas: this.respectReadonlySchemas,
                onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas
            }
        });
    }

    public async toFernWorkspace(
        { context }: { context: TaskContext },
        settings?: OpenAPIWorkspace.Settings
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
