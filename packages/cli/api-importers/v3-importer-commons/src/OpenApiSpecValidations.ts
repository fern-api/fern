import { APIErrorLevel, ErrorCollector } from "./ErrorCollector.js";

/**
 * Detects non-ASCII characters (emojis and other unicode characters)
 * that would cause issues in HTTP headers and URL paths.
 * Uses RegExp constructor to avoid biome's noControlCharactersInRegex.
 */
const NON_ASCII_REGEX = new RegExp("[^\\x00-\\x7F]");

/**
 * Regex to detect frontmatter delimiters (---) that would cause YAML parsing failures.
 * Matches descriptions that contain --- on its own line (with optional whitespace).
 */
const FRONTMATTER_DELIMITER_REGEX = /(?:^|\n)\s*---\s*(?:\n|$)/;

/**
 * Validates that tag names do not contain non-ASCII characters (e.g., emojis).
 *
 * Non-ASCII characters in tag names end up in URL paths and HTTP header values
 * (e.g., x-next-cache-tags), which only allow ASCII characters. This causes
 * ERR_INVALID_CHAR errors at runtime.
 *
 * @param tags Array of tag objects with at least a `name` property
 * @param errorCollector The error collector to report errors to
 */
export function validateTagNames({
    tags,
    errorCollector
}: {
    tags: Array<{ name: string; description?: string }>;
    errorCollector: ErrorCollector;
}): void {
    for (const tag of tags) {
        if (NON_ASCII_REGEX.test(tag.name)) {
            const nonAsciiChars = [...tag.name].filter((c) => NON_ASCII_REGEX.test(c));
            errorCollector.collect({
                level: APIErrorLevel.ERROR,
                message:
                    `Tag name "${tag.name}" contains non-ASCII characters: ${nonAsciiChars.join(", ")}. ` +
                    `Non-ASCII characters in tag names will be included in URL paths and HTTP headers, ` +
                    `which only support ASCII characters. This will cause runtime errors (ERR_INVALID_CHAR).`,
                path: ["tags", tag.name],
                resolution: `Remove non-ASCII characters from the tag name. For example, rename "${tag.name}" to "${tag.name.replace(NON_ASCII_REGEX, "").trim()}".`
            });
        }
    }
}

/**
 * Validates that endpoint/operation descriptions do not contain frontmatter delimiters (---).
 *
 * When descriptions contain `---` delimiters, the docs renderer (gray-matter) interprets
 * the content between them as YAML frontmatter. If the content is not valid YAML
 * (e.g., contains `>` blockquote syntax), this causes a YAMLException and a 500 error
 * on the generated docs site.
 *
 * @param description The description string to validate
 * @param path The breadcrumb path for error reporting
 * @param errorCollector The error collector to report errors to
 */
export function validateDescription({
    description,
    path,
    errorCollector
}: {
    description: string;
    path: string[];
    errorCollector: ErrorCollector;
}): void {
    if (FRONTMATTER_DELIMITER_REGEX.test(description)) {
        errorCollector.collect({
            level: APIErrorLevel.ERROR,
            message:
                `Description contains "---" frontmatter delimiters which will cause YAML parsing failures ` +
                `in the generated docs site. The docs renderer interprets content between "---" delimiters ` +
                `as YAML frontmatter, which will fail if the content is not valid YAML.`,
            path,
            resolution: `Remove the "---" delimiters from the description.`
        });
    }
}

/**
 * Validates all tags and operation descriptions in an OpenAPI spec.
 * This is the main entry point for spec-level validation.
 *
 * @param spec The OpenAPI spec to validate
 * @param errorCollector The error collector to report errors to
 */
export function validateOpenApiSpec({
    spec,
    errorCollector
}: {
    // biome-ignore lint/suspicious/noExplicitAny: Accept any OpenAPI document shape (v3, v3.1, etc.)
    spec: Record<string, any>;
    errorCollector: ErrorCollector;
}): void {
    // Validate top-level tags
    if (Array.isArray(spec.tags)) {
        const tags = spec.tags.filter(
            (tag: unknown): tag is { name: string; description?: string } =>
                typeof tag === "object" &&
                tag != null &&
                "name" in tag &&
                typeof (tag as { name: string }).name === "string"
        );
        validateTagNames({ tags, errorCollector });
    }

    // Validate operation descriptions and inline tag references
    const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "options", "head", "trace"];
    if (spec.paths != null && typeof spec.paths === "object") {
        const seenTags = new Set<string>();
        for (const [path, pathItem] of Object.entries(spec.paths as Record<string, unknown>)) {
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
                // Validate operation description
                if (typeof op.description === "string") {
                    validateDescription({
                        description: op.description,
                        path: ["paths", path, method, "description"],
                        errorCollector
                    });
                }
                // Validate tags referenced in operations that may not be in top-level tags
                if (Array.isArray(op.tags) && !Array.isArray(spec.tags)) {
                    for (const tag of op.tags) {
                        if (typeof tag === "string" && !seenTags.has(tag) && NON_ASCII_REGEX.test(tag)) {
                            seenTags.add(tag);
                            const nonAsciiChars = [...tag].filter((c) => NON_ASCII_REGEX.test(c));
                            errorCollector.collect({
                                level: APIErrorLevel.ERROR,
                                message:
                                    `Tag name "${tag}" contains non-ASCII characters: ${nonAsciiChars.join(", ")}. ` +
                                    `Non-ASCII characters in tag names will be included in URL paths and HTTP headers, ` +
                                    `which only support ASCII characters. This will cause runtime errors (ERR_INVALID_CHAR).`,
                                path: ["paths", path, method, "tags"],
                                resolution: `Remove non-ASCII characters from the tag name. For example, rename "${tag}" to "${tag.replace(NON_ASCII_REGEX, "").trim()}".`
                            });
                        }
                    }
                }
            }
        }
    }
}
