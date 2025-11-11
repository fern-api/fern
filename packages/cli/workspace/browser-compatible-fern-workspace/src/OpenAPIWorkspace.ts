import { BaseOpenAPIWorkspace, BaseOpenAPIWorkspaceSync } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { ParseOpenAPIOptions, parse } from "@fern-api/openapi-ir-parser";
import { AbsoluteFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPI } from "openapi-types";

import { InMemoryOpenAPILoader } from "./InMemoryOpenAPILoader";

const IN_MEMORY_ABSOLUTE_FILEPATH = AbsoluteFilePath.of("/<memory>");

const DEFAULT_WORKSPACE_ARGS = {
    absoluteFilePath: IN_MEMORY_ABSOLUTE_FILEPATH,
    cliVersion: "<unknown>",
    workspaceName: "anonymous"
};

export declare namespace OpenAPIWorkspace {
    export interface Args {
        spec: Spec;
        generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    }

    export interface Spec {
        parsed: OpenAPI.Document;
        overrides?: Partial<OpenAPI.Document>;
        settings?: Settings;
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

export class OpenAPIWorkspace extends BaseOpenAPIWorkspaceSync {
    private spec: OpenAPIWorkspace.Spec;
    private loader: InMemoryOpenAPILoader;
    private readonly parseOptions: Partial<ParseOpenAPIOptions>;

    public type = "openapi";

    constructor({ spec, generatorsConfiguration }: OpenAPIWorkspace.Args) {
        super({
            ...DEFAULT_WORKSPACE_ARGS,
            generatorsConfiguration,
            respectReadonlySchemas: spec.settings?.respectReadonlySchemas,
            respectNullableSchemas: spec.settings?.respectNullableSchemas,
            wrapReferencesToNullableInOptional: spec.settings?.wrapReferencesToNullableInOptional,
            coerceOptionalSchemasToNullable: spec.settings?.coerceOptionalSchemasToNullable,
            onlyIncludeReferencedSchemas: spec.settings?.onlyIncludeReferencedSchemas,
            inlinePathParameters: spec.settings?.inlinePathParameters,
            objectQueryParameters: spec.settings?.objectQueryParameters,
            exampleGeneration: spec.settings?.exampleGeneration,
            useBytesForBinaryResponse: spec.settings?.useBytesForBinaryResponse,
            respectForwardCompatibleEnums: spec.settings?.respectForwardCompatibleEnums,
            inlineAllOfSchemas: spec.settings?.inlineAllOfSchemas,
            resolveAliases: spec.settings?.resolveAliases,
            groupEnvironmentsByHost: spec.settings?.groupEnvironmentsByHost,
            removeDiscriminantsFromSchemas: spec.settings?.removeDiscriminantsFromSchemas
        });
        this.spec = spec;
        this.loader = new InMemoryOpenAPILoader();
        this.parseOptions = {
            onlyIncludeReferencedSchemas: this.onlyIncludeReferencedSchemas,
            respectReadonlySchemas: this.respectReadonlySchemas,
            inlinePathParameters: this.inlinePathParameters,
            objectQueryParameters: this.objectQueryParameters,
            useBytesForBinaryResponse: this.useBytesForBinaryResponse,
            respectForwardCompatibleEnums: this.respectForwardCompatibleEnums,
            resolveAliases: this.resolveAliases,
            groupEnvironmentsByHost: this.groupEnvironmentsByHost
        };
    }

    public getOpenAPIIr(
        {
            context
        }: {
            context: TaskContext;
        },
        options?: OpenAPIWorkspace.Settings
    ): OpenApiIntermediateRepresentation {
        const document = this.loader.loadDocument(this.spec);
        return parse({
            context,
            documents: [document],
            options: {
                ...this.parseOptions,
                ...options
            }
        });
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [];
    }
}
