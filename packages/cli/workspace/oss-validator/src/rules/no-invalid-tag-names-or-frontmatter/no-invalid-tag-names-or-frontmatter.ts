import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { readFile } from "fs/promises";

import { Rule } from "../../Rule.js";
import { ValidationViolation } from "../../ValidationViolation.js";

// Use RegExp constructor to avoid biome's noControlCharactersInRegex lint rule
const NON_ASCII_REGEX = new RegExp("[^\\x00-\\x7F]");
const FRONTMATTER_REGEX = /(?:^|\n)\s*---\s*(?:\n|$)/;

const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "options", "head", "trace"];

/**
 * Validates that OpenAPI specs don't contain:
 * 1. Tag names with non-ASCII characters (emojis, unicode) - these end up in URL paths
 *    and HTTP headers (x-next-cache-tags), causing ERR_INVALID_CHAR at runtime.
 * 2. Endpoint descriptions with `---` frontmatter delimiters - gray-matter interprets
 *    these as YAML frontmatter, causing YAMLException and 500 errors on docs sites.
 */
export const NoInvalidTagNamesOrFrontmatterRule: Rule = {
    name: "no-invalid-tag-names-or-frontmatter",
    run: async ({ workspace, specs, context }) => {
        const violations: ValidationViolation[] = [];

        for (const spec of specs) {
            if (spec.type !== "openapi") {
                continue;
            }

            const contents = (await readFile(spec.absoluteFilepath)).toString();

            if (!contents.includes("openapi") && !contents.includes("swagger")) {
                continue;
            }

            const openAPI = await loadOpenAPI({
                absolutePathToOpenAPI: spec.absoluteFilepath,
                context,
                absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides,
                absolutePathToOpenAPIOverlays: spec.absoluteFilepathToOverlays
            });

            const apiToValidate = isOpenAPIV2(openAPI) ? await convertOpenAPIV2ToV3(openAPI) : openAPI;
            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

            // biome-ignore lint/suspicious/noExplicitAny: OpenAPI document type
            const apiDoc = apiToValidate as Record<string, any>;

            // Validate top-level tag names for non-ASCII characters
            if (Array.isArray(apiDoc.tags)) {
                for (const tag of apiDoc.tags) {
                    if (typeof tag === "object" && tag != null && typeof tag.name === "string") {
                        if (NON_ASCII_REGEX.test(tag.name)) {
                            const nonAsciiChars = [...tag.name].filter((c) => NON_ASCII_REGEX.test(c));
                            violations.push({
                                name: "no-invalid-tag-names-or-frontmatter",
                                severity: "error",
                                relativeFilepath,
                                nodePath: ["tags", tag.name],
                                message:
                                    `Tag name "${tag.name}" contains non-ASCII characters: ${nonAsciiChars.join(", ")}. ` +
                                    `Non-ASCII characters in tag names will be included in URL paths and HTTP headers, ` +
                                    `which only support ASCII characters. This will cause runtime errors (ERR_INVALID_CHAR). ` +
                                    `Remove non-ASCII characters from the tag name.`
                            });
                        }
                    }
                }
            }

            // Validate operation descriptions for frontmatter delimiters and inline tag names
            if (apiDoc.paths != null && typeof apiDoc.paths === "object") {
                const seenInlineTags = new Set<string>();
                for (const [path, pathItem] of Object.entries(apiDoc.paths as Record<string, unknown>)) {
                    if (pathItem == null || typeof pathItem !== "object") {
                        continue;
                    }
                    const pathObj = pathItem as Record<string, unknown>;
                    for (const method of HTTP_METHODS) {
                        const operation = pathObj[method];
                        if (operation == null || typeof operation !== "object") {
                            continue;
                        }
                        const op = operation as Record<string, unknown>;

                        // Check for frontmatter delimiters in description
                        if (typeof op.description === "string" && FRONTMATTER_REGEX.test(op.description)) {
                            violations.push({
                                name: "no-invalid-tag-names-or-frontmatter",
                                severity: "error",
                                relativeFilepath,
                                nodePath: ["paths", path, method, "description"],
                                message:
                                    `Endpoint description for ${method.toUpperCase()} ${path} contains "---" which will be ` +
                                    `interpreted as a YAML frontmatter delimiter by the docs renderer, causing parsing ` +
                                    `failures and 500 errors on the generated docs site. Remove the "---" delimiters ` +
                                    `from the description.`
                            });
                        }

                        // Check inline tag names (tags referenced in operations but not in top-level tags)
                        if (Array.isArray(op.tags) && !Array.isArray(apiDoc.tags)) {
                            for (const tag of op.tags) {
                                if (typeof tag === "string" && !seenInlineTags.has(tag) && NON_ASCII_REGEX.test(tag)) {
                                    seenInlineTags.add(tag);
                                    const nonAsciiChars = [...tag].filter((c) => NON_ASCII_REGEX.test(c));
                                    violations.push({
                                        name: "no-invalid-tag-names-or-frontmatter",
                                        severity: "error",
                                        relativeFilepath,
                                        nodePath: ["paths", path, method, "tags"],
                                        message:
                                            `Tag name "${tag}" contains non-ASCII characters: ${nonAsciiChars.join(", ")}. ` +
                                            `Non-ASCII characters in tag names will be included in URL paths and HTTP headers, ` +
                                            `which only support ASCII characters. This will cause runtime errors (ERR_INVALID_CHAR). ` +
                                            `Remove non-ASCII characters from the tag name.`
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return violations;
    }
};
