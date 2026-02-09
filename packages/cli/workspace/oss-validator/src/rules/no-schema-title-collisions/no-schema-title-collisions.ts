import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { readFile } from "fs/promises";

import { Rule } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

interface TitleEntry {
    schemaId: string;
    specFile: string;
}

export const NoSchemaTitleCollisionsRule: Rule = {
    name: "no-schema-title-collisions",
    run: async ({ workspace, specs, context }) => {
        const violations: ValidationViolation[] = [];

        // Global title registry across all specs (matching parser behavior)
        const titleRegistry = new Map<string, TitleEntry>();

        for (const spec of specs) {
            if (spec.type !== "openapi") {
                continue;
            }

            const settings = spec.settings;

            // Only check for collisions when:
            // 1. useTitlesAsName is enabled (feature is active)
            // 2. resolveSchemaCollisions is false (strict mode - want errors, not auto-resolution)
            if (settings?.useTitlesAsName !== true || settings?.resolveSchemaCollisions === true) {
                continue;
            }

            const contents = (await readFile(spec.absoluteFilepath)).toString();
            const isAsyncAPI = contents.includes("asyncapi:");
            const isOpenAPI = contents.includes("openapi") || contents.includes("swagger");

            if (!isOpenAPI && !isAsyncAPI) {
                continue;
            }

            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

            // Load the document (with overrides applied)
            const document = await loadOpenAPI({
                absolutePathToOpenAPI: spec.absoluteFilepath,
                context,
                absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides,
                absolutePathToOpenAPIOverlays: spec.absoluteFilepathToOverlays
            });

            // For OpenAPI v2, convert to v3 first
            const apiToValidate = isOpenAPIV2(document) ? await convertOpenAPIV2ToV3(document) : document;

            // Check component schemas for title collisions
            const schemas = apiToValidate.components?.schemas ?? {};

            for (const [schemaId, schema] of Object.entries(schemas)) {
                if (typeof schema !== "object" || schema == null || !("title" in schema)) {
                    continue;
                }

                const title = schema.title;
                if (typeof title !== "string" || title.trim() === "") {
                    continue;
                }

                const existing = titleRegistry.get(title);
                if (existing != null) {
                    violations.push({
                        severity: "error",
                        relativeFilepath,
                        nodePath: ["components", "schemas", schemaId, "title"],
                        message: `Schema title collision detected: Multiple schemas use title '${title}'. Schema '${schemaId}' conflicts with schema '${existing.schemaId}'. Use 'resolve-schema-collisions: true' to automatically resolve collisions.`
                    });
                } else {
                    titleRegistry.set(title, { schemaId, specFile: relativeFilepath });
                }
            }
        }

        return violations;
    }
};
