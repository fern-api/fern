/**
 * Detects if the given file contents represent a Swagger 2.0 (OpenAPI v2) specification.
 * Handles both YAML and JSON formats.
 *
 * @param contents - The raw file contents as a string
 * @returns true if the file is a Swagger 2.0 specification
 */
export function isSwagger2(contents: string): boolean {
    // YAML format detection: swagger: "2.0", swagger: '2.0', or swagger: 2.0
    const isYamlSwagger2 =
        contents.includes("swagger:") &&
        (contents.includes('swagger: "2.0"') ||
            contents.includes("swagger: '2.0'") ||
            contents.includes("swagger: 2.0"));

    // JSON format detection: "swagger": "2.0" (with possible whitespace variations)
    const isJsonSwagger2 = /"swagger"\s*:\s*"2\.0"/.test(contents);

    return isYamlSwagger2 || isJsonSwagger2;
}
