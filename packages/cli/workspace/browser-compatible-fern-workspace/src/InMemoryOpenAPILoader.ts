import { OpenAPIDocument, SpecImportSettings } from "@fern-api/openapi-ir-parser";
import { OpenAPI } from "openapi-types";
import { bundle, Source } from "@redocly/openapi-core";
import { DEFAULT_BUNDLE_OPTIONS } from "./constants";
import { mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";

export interface Spec {
    parsed: OpenAPI.Document;
    overrides?: OpenAPI.Document;
    settings?: SpecImportSettings;
}

export class InMemoryOpenAPILoader {
    public async loadDocument(spec: Spec): Promise<OpenAPIDocument> {
        return {
            type: "openapi",
            value: await this.loadParsedOpenAPI({
                openapi: spec.parsed,
                overrides: spec.overrides
            }),
            settings: spec.settings
        };
    }

    private async loadParsedOpenAPI({
        openapi,
        overrides
    }: {
        openapi: OpenAPI.Document;
        overrides: OpenAPI.Document | undefined;
    }): Promise<OpenAPI.Document> {
        const parsed = await this.parseOpenAPI({
            parsed: openapi
        });
        if (overrides != null) {
            const merged = await coreMergeWithOverrides({ data: parsed, overrides });
            return await this.parseOpenAPI({
                parsed: merged
            });
        }
        return parsed;
    }

    private async parseOpenAPI({ parsed }: { parsed: OpenAPI.Document }): Promise<OpenAPI.Document> {
        const result = await bundle({
            ...DEFAULT_BUNDLE_OPTIONS,
            doc: {
                source: new Source("<memory>", "<openapi>"),
                parsed
            }
        });
        return result.bundle.parsed;
    }
}
