import { relative } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { Rule, RuleViolation } from "../../Rule";

export const NoOpenApiV2InDocsRule: Rule = {
    name: "no-openapi-v2-in-docs",
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

                                // Simple check for OpenAPI v2 by looking for "swagger: " pattern
                                if (
                                    contents.includes("swagger:") &&
                                    (contents.includes('swagger: "2.0"') ||
                                        contents.includes("swagger: '2.0'") ||
                                        contents.includes("swagger: 2.0"))
                                ) {
                                    violations.push({
                                        severity: "error",
                                        name: "OpenAPI v2.0 not supported",
                                        message: `OpenAPI version 2.0 (Swagger) is not supported in docs generation. Please upgrade to OpenAPI 3.0 or later.`,
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
