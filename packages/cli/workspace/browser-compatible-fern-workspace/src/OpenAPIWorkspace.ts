import {
    AbstractAPIWorkspace,
    BaseOpenAPIWorkspace,
    getOptionsOverridesFromSettings
} from "@fern-api/api-workspace-commons";
import { SpecImportSettings } from "@fern-api/openapi-ir-parser";
import { OpenAPI } from "openapi-types";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenApiIntermediateRepresentation } from "@fern-api/openapi-ir";
import { parse } from "@fern-api/openapi-ir-parser";
import { InMemoryOpenAPILoader } from "./InMemoryOpenAPILoader";

const IN_MEMORY_ABSOLUTE_FILEPATH = AbsoluteFilePath.of("/<memory>");

const DEFAULT_WORKSPACE_ARGS = {
    absoluteFilePath: IN_MEMORY_ABSOLUTE_FILEPATH,
    cliVersion: "<unknown>",
    workspaceName: "anonymous"
};

export declare namespace OpenAPIWorkspace {
    export interface Args extends AbstractAPIWorkspace.Args {
        spec: Spec;
    }

    export interface Spec {
        parsed: OpenAPI.Document;
        overrides?: OpenAPI.Document;
        settings?: SpecImportSettings;
    }

    export type Settings = BaseOpenAPIWorkspace.Settings;
}

export class OpenAPIWorkspace extends BaseOpenAPIWorkspace {
    private spec: OpenAPIWorkspace.Spec;
    private loader: InMemoryOpenAPILoader;

    constructor({ spec, generatorsConfiguration }: OpenAPIWorkspace.Args) {
        super({
            ...DEFAULT_WORKSPACE_ARGS,
            generatorsConfiguration,
            respectReadonlySchemas: spec.settings?.respectReadonlySchemas ?? false,
            onlyIncludeReferencedSchemas: spec.settings?.onlyIncludeReferencedSchemas ?? false,
            inlinePathParameters: spec.settings?.inlinePathParameters ?? false,
            objectQueryParameters: spec.settings?.objectQueryParameters ?? false
        });
        this.spec = spec;
        this.loader = new InMemoryOpenAPILoader();
    }

    public async getOpenAPIIr(
        {
            context
        }: {
            context: TaskContext;
        },
        settings?: OpenAPIWorkspace.Settings
    ): Promise<OpenApiIntermediateRepresentation> {
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

    public getAbsoluteFilePaths(): AbsoluteFilePath[] {
        return [];
    }
}
