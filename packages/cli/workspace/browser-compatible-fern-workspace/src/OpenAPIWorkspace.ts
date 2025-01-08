import { OpenAPI } from "openapi-types";

import { BaseOpenAPIWorkspace, BaseOpenAPIWorkspaceSync } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { AbsoluteFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";

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

    constructor({ spec, generatorsConfiguration }: OpenAPIWorkspace.Args) {
        super({
            ...DEFAULT_WORKSPACE_ARGS,
            generatorsConfiguration,
            respectReadonlySchemas: spec.settings?.respectReadonlySchemas,
            onlyIncludeReferencedSchemas: spec.settings?.onlyIncludeReferencedSchemas,
            inlinePathParameters: spec.settings?.inlinePathParameters,
            objectQueryParameters: spec.settings?.objectQueryParameters,
            exampleGeneration: spec.settings?.exampleGeneration
        });
        this.spec = spec;
        this.loader = new InMemoryOpenAPILoader();
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
                ...options,
                onlyIncludeReferencedSchemas:
                    options?.onlyIncludeReferencedSchemas ?? this.onlyIncludeReferencedSchemas,
                respectReadonlySchemas: options?.respectReadonlySchemas ?? this.respectReadonlySchemas,
                inlinePathParameters: options?.inlinePathParameters ?? this.inlinePathParameters,
                objectQueryParameters: options?.objectQueryParameters ?? this.objectQueryParameters
            }
        });
    }

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [];
    }
}
