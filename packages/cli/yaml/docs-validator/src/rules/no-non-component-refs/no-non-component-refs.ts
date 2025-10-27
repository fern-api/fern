import { relative } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { Rule, RuleViolation } from "../../Rule";

export const NoNonComponentRefsRule: Rule = {
    name: "no-non-component-refs",
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

                                // Find all $ref references in the OpenAPI spec
                                const refMatches = contents.matchAll(/["']?\$ref["']?\s*:\s*["']([^"']+)["']/g);

                                for (const match of refMatches) {
                                    const ref = match[1];
                                    if (!ref) {
                                        continue;
                                    }

                                    // Check if the reference is pointing to a non-component location
                                    if (ref.startsWith("#/") && !ref.startsWith("#/components/")) {
                                        violations.push({
                                            severity: "error",
                                            name: "Invalid OpenAPI reference",
                                            message: `Reference "${ref}" points to a non-component location. OpenAPI references should point to reusable components under #/components/ (e.g., #/components/schemas/MySchema, #/components/responses/MyResponse). Direct references to paths, operations, or other spec sections are not supported.`,
                                            relativeFilepath: relativePath as any
                                        });
                                    }
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
