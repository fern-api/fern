import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3 } from "@fern-api/lazy-fern-workspace";

import { Rule } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

interface SchemaEntry {
    schemaId: string;
    specFile: string;
}

export const NoComponentSchemaCollisionsRule: Rule = {
    name: "no-component-schema-collisions",
    run: async ({ workspace, specs, loadedDocuments }) => {
        const violations: ValidationViolation[] = [];

        // Only relevant when there are multiple specs that could collide
        const openapiSpecs = specs.filter((spec) => spec.type === "openapi");
        if (openapiSpecs.length < 2) {
            return violations;
        }

        // Check if any spec has resolveSchemaCollisions enabled (auto-resolution mode)
        const hasResolveEnabled = openapiSpecs.some((spec) => spec.settings?.resolveSchemaCollisions === true);
        if (hasResolveEnabled) {
            return violations;
        }

        // Global schema ID registry across all specs
        const schemaIdRegistry = new Map<string, SchemaEntry>();

        for (const spec of openapiSpecs) {
            const document = loadedDocuments.get(spec.absoluteFilepath);
            if (document == null) {
                continue;
            }

            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

            // For OpenAPI v2, convert to v3 first
            const apiToValidate = isOpenAPIV2(document) ? await convertOpenAPIV2ToV3(document) : document;

            // Check component schemas for ID collisions across specs
            const schemas = apiToValidate.components?.schemas ?? {};

            for (const schemaId of Object.keys(schemas)) {
                const existing = schemaIdRegistry.get(schemaId);
                if (existing != null) {
                    violations.push({
                        name: "no-component-schema-collisions",
                        severity: "warning",
                        relativeFilepath,
                        nodePath: ["components", "schemas", schemaId],
                        message: `Component schema collision detected: Schema '${schemaId}' is defined in both '${existing.specFile}' and '${relativeFilepath}'. One will overwrite the other. Rename the schema in one of the specs or use namespaces to avoid conflicts.`
                    });
                } else {
                    schemaIdRegistry.set(schemaId, { schemaId, specFile: relativeFilepath });
                }
            }
        }

        return violations;
    }
};
