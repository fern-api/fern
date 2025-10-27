import { relative } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { Rule, RuleViolation } from "../../Rule";

/**
 * Validates that a reference path exists in the OpenAPI specification
 */
function validateReference(ref: string, spec: any): boolean {
    // Remove leading # and split by /
    const pathParts = ref
        .replace(/^#\//, "")
        .split("/")
        .map((part) =>
            // Decode JSON Pointer escapes: ~1 -> /, ~0 -> ~
            part
                .replace(/~1/g, "/")
                .replace(/~0/g, "~")
        );

    let current = spec;

    for (const part of pathParts) {
        if (current == null || typeof current !== "object") {
            return false;
        }

        current = current[part];

        if (current === undefined) {
            return false;
        }
    }

    return current !== null && current !== undefined;
}

/**
 * Generates an informative error message for missing OpenAPI references
 */
function createInformativeErrorMessage(invalidRefs: string[]): string {
    const refsByType = new Map<string, string[]>();

    // Group references by type for better organization
    for (const ref of invalidRefs) {
        const refPath = ref.replace(/^#\//, "").split("/");
        let category = "Other";

        if (refPath.length >= 2) {
            if (refPath[0] === "components") {
                const componentType = refPath[1] ?? "unknown";
                category = `components/${componentType}`;
            } else {
                category = refPath[0] ?? "unknown";
            }
        }

        if (!refsByType.has(category)) {
            refsByType.set(category, []);
        }
        refsByType.get(category)!.push(ref);
    }

    let message = `Found ${invalidRefs.length} invalid OpenAPI reference${invalidRefs.length === 1 ? "" : "s"}:\n\n`;

    for (const [category, refs] of refsByType) {
        message += `${category}:\n`;
        for (const ref of refs) {
            message += `    ${ref}\n`;
        }
        message += "\n";
    }

    message += "These references point to locations that don't exist in the OpenAPI specification. ";
    message += "Please ensure all referenced components are defined or remove the invalid references.";

    return message;
}

export const ValidLocalReferencesRule: Rule = {
    name: "valid-local-references",
    create: ({ ossWorkspaces, logger, workspace: docsWorkspace }) => {
        return {
            file: async () => {
                const violations: RuleViolation[] = [];
                const processedFiles = new Set<string>(); // Track processed files to avoid duplicates

                for (const workspace of ossWorkspaces) {
                    for (const spec of workspace.specs) {
                        if (spec.type === "openapi" && !processedFiles.has(spec.absoluteFilepath)) {
                            processedFiles.add(spec.absoluteFilepath);
                            try {
                                const contents = (await readFile(spec.absoluteFilepath)).toString();

                                // Use the docs workspace as reference point for more descriptive path
                                const relativePath = relative(docsWorkspace.absoluteFilePath, spec.absoluteFilepath);

                                // Skip OpenAPI v2 files - they should be handled by the v2 rule first
                                const isOpenApiV2 =
                                    contents.includes("swagger:") &&
                                    (contents.includes('swagger: "2.0"') ||
                                        contents.includes("swagger: '2.0'") ||
                                        contents.includes("swagger: 2.0"));

                                if (isOpenApiV2) {
                                    continue; // Skip v2 files
                                }

                                // Parse the OpenAPI document to get the actual structure
                                let parsedSpec: any;
                                try {
                                    parsedSpec = yaml.load(contents) as any;
                                } catch (parseError) {
                                    logger.debug(`Could not parse OpenAPI spec file: ${spec.absoluteFilepath}`);
                                    continue;
                                }

                                if (!parsedSpec || typeof parsedSpec !== "object") {
                                    continue;
                                }

                                // Find all $ref references in the OpenAPI spec
                                const refMatches = contents.matchAll(/["']?\$ref["']?\s*:\s*["']([^"']+)["']/g);
                                const allRefs = new Set<string>();

                                for (const match of refMatches) {
                                    const ref = match[1];
                                    if (ref && ref.startsWith("#/")) {
                                        allRefs.add(ref);
                                    }
                                }

                                // Collect all invalid references for this file
                                const invalidRefs: string[] = [];
                                for (const ref of allRefs) {
                                    if (!validateReference(ref, parsedSpec)) {
                                        invalidRefs.push(ref);
                                    }
                                }

                                // If we found invalid references, create a single grouped violation
                                if (invalidRefs.length > 0) {
                                    const errorMessage = createInformativeErrorMessage(invalidRefs);

                                    violations.push({
                                        severity: "error",
                                        name: "Invalid OpenAPI References",
                                        message: errorMessage,
                                        relativeFilepath: relativePath
                                    });
                                }
                            } catch (error) {
                                logger.warn(`Could not read OpenAPI spec file: ${spec.absoluteFilepath}`);
                                continue;
                            }
                        }
                    }
                }

                return violations;
            }
        };
    }
};
