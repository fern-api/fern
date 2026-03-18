import { relative } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { Rule, RuleViolation } from "../../Rule.js";

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

                                // Simple check for OpenAPI v2 by looking for "swagger" pattern
                                // Check both YAML format (swagger: "2.0") and JSON format ("swagger": "2.0")
                                const isOpenApiV2Yaml =
                                    contents.includes("swagger:") &&
                                    (contents.includes('swagger: "2.0"') ||
                                        contents.includes("swagger: '2.0'") ||
                                        contents.includes("swagger: 2.0"));
                                const isOpenApiV2Json =
                                    contents.includes('"swagger":') &&
                                    (contents.includes('"swagger":"2.0"') || contents.includes('"swagger": "2.0"'));
                                if (isOpenApiV2Yaml || isOpenApiV2Json) {
                                    violations.push({
                                        severity: "warning",
                                        name: "OpenAPI v2.0 detected",
                                        message: `OpenAPI version 2.0 (Swagger) detected. Consider upgrading to OpenAPI 3.0 or later.`,
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
