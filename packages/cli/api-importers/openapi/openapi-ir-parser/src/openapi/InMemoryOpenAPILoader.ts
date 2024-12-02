import { OpenAPIDocument, SpecImportSettings } from "../parse";
import { OpenAPI } from "openapi-types";
import { bundle, Config, Source } from "@redocly/openapi-core";
import { BundleOptions } from "@redocly/openapi-core/lib/bundle";
import { mergeWithOverrides as coreMergeWithOverrides } from "@fern-api/core-utils";
import { FERN_TYPE_EXTENSIONS } from "./v3/extensions/fernExtensions";

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
        const options: BundleOptions = {
            config: new Config(
                {
                    apis: {},
                    styleguide: {
                        plugins: [FERN_TYPE_EXTENSIONS],
                        rules: {
                            spec: "warn"
                        }
                    }
                },
                undefined
            ),
            dereference: false,
            removeUnusedComponents: false,
            keepUrlRefs: true
        };
        const result = await bundle({
            ...options,
            doc: {
                source: new Source("<memory>", "<openapi>"),
                parsed
            }
        });
        return result.bundle.parsed;
    }
}
