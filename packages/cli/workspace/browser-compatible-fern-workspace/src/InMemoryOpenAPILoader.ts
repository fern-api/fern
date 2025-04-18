import { OpenAPI, OpenAPIV3 } from "openapi-types";

import { isOpenAPIV2, isOpenAPIV3_1 } from "@fern-api/api-workspace-commons";
import { mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";
import { OpenAPIDocument, getParseOptions } from "@fern-api/openapi-ir-parser";

import { OpenAPIWorkspace } from "./OpenAPIWorkspace";

export class InMemoryOpenAPILoader {
    public loadDocument(spec: OpenAPIWorkspace.Spec): OpenAPIDocument {
        return {
            type: "openapi",
            value: this.loadParsedOpenAPI({
                openapi: spec.parsed,
                overrides: spec.overrides
            }),
            settings: spec.settings != null ? getParseOptions({ overrides: spec.settings }) : undefined
        };
    }

    private loadParsedOpenAPI({
        openapi,
        overrides
    }: {
        openapi: OpenAPI.Document;
        overrides: Partial<OpenAPI.Document> | undefined;
    }): OpenAPIV3.Document {
        if (isOpenAPIV2(openapi)) {
            throw new Error("Swagger v2.0 is not supported in the browser");
        }
        const v3 = openapi as OpenAPIV3.Document;
        if (overrides != null) {
            return coreMergeWithOverrides({ data: v3, overrides });
        }
        return v3;
    }
}
