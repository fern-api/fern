import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { applyOpenAPIOverlay, mergeWithOverrides as coreMergeWithOverrides, type Overlay } from "@fern-api/core-utils";
import { getParseOptions, OpenAPIDocument } from "@fern-api/openapi-ir-parser";
import { OpenAPI, OpenAPIV3 } from "openapi-types";

import { OpenAPIWorkspace } from "./OpenAPIWorkspace";

export class InMemoryOpenAPILoader {
    public loadDocument(spec: OpenAPIWorkspace.Spec): OpenAPIDocument {
        return {
            type: "openapi",
            value: this.loadParsedOpenAPI({
                openapi: spec.parsed,
                overrides: spec.overrides,
                overlays: spec.overlays
            }),
            settings: getParseOptions({ options: spec.settings })
        };
    }

    private loadParsedOpenAPI({
        openapi,
        overrides,
        overlays
    }: {
        openapi: OpenAPI.Document;
        overrides: Partial<OpenAPI.Document> | undefined;
        overlays: Overlay | undefined;
    }): OpenAPIV3.Document {
        if (isOpenAPIV2(openapi)) {
            throw new Error("Swagger v2.0 is not supported in the browser");
        }
        let result = openapi as OpenAPIV3.Document;

        // Apply overrides first
        if (overrides != null) {
            result = coreMergeWithOverrides({ data: result, overrides });
        }

        // Apply overlays after overrides (same order as file-based loading)
        if (overlays != null) {
            result = applyOpenAPIOverlay({ data: result, overlay: overlays });
        }

        return result;
    }
}
