import { getOpenAPISettings } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { OpenAPIConverterContext3_1 } from "@fern-api/openapi-to-ir";
import { ErrorCollector, ExampleValidator, type SpecExampleValidationResult } from "@fern-api/v3-importer-commons";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { OpenAPIV3_1 } from "openapi-types";

import { Rule, RuleViolation } from "../../Rule";

export const ValidOpenApiExamples: Rule = {
    name: "valid-openapi-examples",
    create: ({ ossWorkspaces, logger, workspace: docsWorkspace }) => {
        return {
            file: async () => {
                const violations: RuleViolation[] = [];
                const processedFiles = new Set<string>(); // Track processed files to avoid duplicates

                for (const workspace of ossWorkspaces) {
                    if (!(workspace instanceof OSSWorkspace)) {
                        continue;
                    }

                    for (const spec of workspace.specs) {
                        if (spec.type === "openapi" && !processedFiles.has(spec.absoluteFilepath)) {
                            processedFiles.add(spec.absoluteFilepath);

                            try {
                                const validationResult = await validateOpenApiExamples({
                                    specPath: spec.absoluteFilepath,
                                    logger
                                });

                                if (validationResult) {
                                    // Use the docs workspace as reference point for more descriptive path
                                    const relativePath = relative(
                                        docsWorkspace.absoluteFilePath,
                                        spec.absoluteFilepath
                                    );

                                    // Group errors by endpoint for cleaner reporting
                                    const errorsByEndpoint = new Map<
                                        string,
                                        Array<{ exampleName?: string; errors: any[] }>
                                    >();

                                    for (const invalidExample of validationResult.invalidHumanExamples) {
                                        const endpointKey = `${invalidExample.method.toUpperCase()} ${invalidExample.endpointPath}`;
                                        if (!errorsByEndpoint.has(endpointKey)) {
                                            errorsByEndpoint.set(endpointKey, []);
                                        }
                                        errorsByEndpoint.get(endpointKey)!.push({
                                            exampleName: invalidExample.exampleName,
                                            errors: invalidExample.errors
                                        });
                                    }

                                    // Create user-friendly error messages grouped by endpoint
                                    const endpointKeys = Array.from(errorsByEndpoint.keys());
                                    for (let i = 0; i < endpointKeys.length; i++) {
                                        const endpointKey = endpointKeys[i]!;
                                        const examples = errorsByEndpoint.get(endpointKey);
                                        if (!examples) continue;
                                        let errorMessage = `Errors for ${endpointKey}:\n`;
                                        let errorCount = 0;

                                        for (const example of examples) {
                                            const examplePrefix = example.exampleName
                                                ? ` (example: "${example.exampleName}")`
                                                : "";
                                            if (examplePrefix) {
                                                errorMessage += `\n  Example "${example.exampleName}":\n`;
                                            }

                                            for (const error of example.errors) {
                                                errorCount++;
                                                const friendlyMessage = createFriendlyErrorMessage(error);
                                                const indent = examplePrefix ? "    " : "  ";
                                                const wrappedMessage = wrapMessage(
                                                    `${errorCount}. ${friendlyMessage}`,
                                                    indent,
                                                    90
                                                );
                                                errorMessage += `${wrappedMessage}\n`;
                                            }
                                        }

                                        // Add extra spacing between endpoints (but not after the last one)
                                        if (i < endpointKeys.length - 1) {
                                            errorMessage += "\n\n";
                                        }

                                        violations.push({
                                            severity: "warning",
                                            name: "Invalid OpenAPI example",
                                            message: errorMessage.trim(),
                                            relativeFilepath: relativePath
                                        });
                                    }

                                    // Log summary if there were examples validated
                                    if (validationResult.totalExamples > 0) {
                                        const summary = `Validated ${validationResult.totalExamples} examples: ${validationResult.validExamples} valid, ${validationResult.invalidExamples} invalid`;
                                        if (validationResult.invalidExamples > 0) {
                                            logger.warn(`${relativePath}: ${summary}`);

                                            // Log detailed breakdown by endpoint for easier debugging
                                            logger.debug(`Example validation details for ${relativePath}:`);
                                            for (const endpoint of validationResult.endpoints) {
                                                if (endpoint.hasInvalidExamples) {
                                                    logger.debug(
                                                        `  ${endpoint.method.toUpperCase()} ${endpoint.endpointPath}: ${endpoint.results.length} examples, ${endpoint.invalidExampleCount} invalid`
                                                    );
                                                }
                                            }
                                        } else {
                                            logger.debug(`${relativePath}: ${summary}`);
                                        }
                                    }
                                }
                            } catch (error) {
                                logger.warn(
                                    `Could not validate examples in OpenAPI spec file: ${spec.absoluteFilepath} - ${error}`
                                );
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

/**
 * Validates human examples in an OpenAPI spec file
 */
async function validateOpenApiExamples({
    specPath,
    logger
}: {
    specPath: string;
    logger: any;
}): Promise<SpecExampleValidationResult | null> {
    try {
        // Read and parse the OpenAPI spec
        const specContent = await readFile(specPath, "utf-8");
        let spec: OpenAPIV3_1.Document;

        try {
            spec = JSON.parse(specContent) as OpenAPIV3_1.Document;
        } catch {
            spec = yaml.load(specContent) as OpenAPIV3_1.Document;
        }

        if (!spec || typeof spec !== "object") {
            logger.debug(`Invalid OpenAPI spec format: ${specPath}`);
            return null;
        }

        // Check if this is actually an OpenAPI v3 spec
        if (!spec.openapi || !spec.openapi.startsWith("3.")) {
            logger.debug(`Skipping non-OpenAPI v3 spec: ${specPath}`);
            return null;
        }

        // Create the converter context needed for ExampleValidator
        const errorCollector = new ErrorCollector({ logger });
        const converterContext = new OpenAPIConverterContext3_1({
            namespace: undefined,
            generationLanguage: "typescript",
            logger,
            smartCasing: false,
            spec,
            exampleGenerationArgs: { disabled: false },
            errorCollector,
            enableUniqueErrorsPerEndpoint: false,
            generateV1Examples: false,
            settings: getOpenAPISettings()
        });

        // Create and use the ExampleValidator
        const validator = new ExampleValidator({ context: converterContext });
        const validationResult = validator.validateHumanExamples({ spec });

        return validationResult;
    } catch (error) {
        logger.warn(`Error validating examples in ${specPath}: ${error}`);
        return null;
    }
}

/**
 * Wraps a message to fit within the specified line length, maintaining proper indentation
 */
function wrapMessage(message: string, indent: string, maxLength: number): string {
    // Calculate the effective max length for continuation lines (account for indent)
    const indentLength = indent.length;
    const continuationIndent = indent + "   "; // Add 3 spaces for continuation
    const maxLineLength = maxLength - indentLength;
    const maxContinuationLength = maxLength - continuationIndent.length;

    // If the message fits on one line, return it with indent
    if (message.length <= maxLineLength) {
        return indent + message;
    }

    // Split into words
    const words = message.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
        const word = words[i]!;
        const isFirstWord = currentLine === "";
        const separator = isFirstWord ? "" : " ";
        const testLine = currentLine + separator + word;

        // Check if this would exceed the line length
        const maxLengthForCurrentLine = lines.length === 0 ? maxLineLength : maxContinuationLength;

        if (testLine.length > maxLengthForCurrentLine && !isFirstWord) {
            // Add current line and start a new one
            const lineIndent = lines.length === 0 ? indent : continuationIndent;
            lines.push(lineIndent + currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    // Add the final line
    if (currentLine.length > 0) {
        const lineIndent = lines.length === 0 ? indent : continuationIndent;
        lines.push(lineIndent + currentLine);
    }

    return lines.join("\n");
}

/**
 * Converts technical validation errors into user-friendly messages
 */
function createFriendlyErrorMessage(error: any): string {
    let message = error.message || "";
    const path = error.path || [];

    // Strip prefixes added by the validator
    if (message.startsWith("Invalid response example: ")) {
        message = message.substring("Invalid response example: ".length);
    } else if (message.startsWith("Invalid request example: ")) {
        message = message.substring("Invalid request example: ".length);
    }

    // Get the field name from the path
    const fieldPath = path.length > 0 ? path.join(".") : "";
    const fieldName = path.length > 0 ? path[path.length - 1] : "value";

    // Pattern matching for common error types
    if (message.includes("cannot be converted to string") && message.includes("undefined")) {
        return `Required property '${fieldName}' is missing from example${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("is not one of the allowed enum values") || message.includes("Invalid response example")) {
        // Extract allowed values from the message format: "Invalid response example: Example is not one of the allowed enum values: [\n  "value1",\n  "value2"\n]"
        const enumMatch = message.match(/\[\s*([\s\S]*?)\s*\]/);
        if (enumMatch) {
            // Parse the allowed values, handling multi-line format
            const allowedValuesText = enumMatch[1];
            const values = allowedValuesText
                .split(/[,\n]/)
                .map((v: string) => v.trim().replace(/^"(.*)"$/, "$1"))
                .filter((v: string) => v && v !== "");

            let allowedText: string;
            if (values.length > 5) {
                allowedText = `[${values.slice(0, 4).join(", ")}, ...]`;
            } else {
                allowedText = `[${values.join(", ")}]`;
            }

            return `Property '${fieldName}' has an invalid enum value${fieldPath ? ` at path: ${fieldPath}` : ""}. Allowed values are: ${allowedText}`;
        }

        return `Property '${fieldName}' has an invalid enum value${fieldPath ? ` at path: ${fieldPath}` : ""}. Please check the schema for allowed values.`;
    }

    if (message.includes("is not a number")) {
        return `Property '${fieldName}' should be a number${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("is not an integer")) {
        return `Property '${fieldName}' should be an integer${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("is not a string")) {
        return `Property '${fieldName}' should be a string${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("is not a boolean")) {
        return `Property '${fieldName}' should be a boolean${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("is not an object")) {
        return `Property '${fieldName}' should be an object${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("is not an array")) {
        return `Property '${fieldName}' should be an array${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (
        message.includes("Additional properties are not allowed") ||
        message.includes("additional property") ||
        message.includes("not allowed")
    ) {
        // Try to extract the actual property name that's not allowed
        const additionalPropMatch =
            message.match(/additional property[s]? (.+?) (?:is|are) not allowed/i) ||
            message.match(/property (.+?) is not allowed/i) ||
            message.match(/Additional properties are not allowed: (.+)/i);

        const extraProperty = additionalPropMatch?.[1]?.replace(/['"]/g, "") || fieldName;
        return `Found unexpected property '${extraProperty}' in example. This property does not exist in the schema${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("Required properties are missing")) {
        return `Missing required properties in example${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    if (message.includes("does not match pattern")) {
        return `Property '${fieldName}' does not match the required format/pattern${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    // Check for other patterns that might indicate unknown properties
    if (message.includes("unexpected") || message.includes("unknown") || message.includes("extra")) {
        return `Found unexpected property '${fieldName}' in example. This property does not exist in the schema${fieldPath ? ` at path: ${fieldPath}` : ""}`;
    }

    // Check for schema validation failures that might indicate property issues
    if (message.includes("does not match schema") || message.includes("schema validation failed")) {
        return `Schema validation failed for property '${fieldName}'${fieldPath ? ` at path: ${fieldPath}` : ""}. Please check if this property exists in the schema and has the correct type`;
    }

    // For any other error types, provide the original message with context
    // If the message looks like it might contain an enum error but we didn't catch it, try simple extraction
    if (message.toLowerCase().includes("enum") || message.toLowerCase().includes("allowed")) {
        return `Property '${fieldName}' has an invalid value${fieldPath ? ` at path: ${fieldPath}` : ""}. Please check the schema for allowed values. (Debug: ${message})`;
    }

    // For debugging - show the original message to understand what we're getting
    return `Property '${fieldName}' validation error${fieldPath ? ` at path: ${fieldPath}` : ""}. (Debug: ${message})`;
}
