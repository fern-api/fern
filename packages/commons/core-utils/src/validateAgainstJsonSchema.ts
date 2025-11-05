import Ajv, { ErrorObject } from "ajv";
import { JSONSchema4 } from "json-schema";

// Type guards and interfaces
interface SchemaWithUnion extends JSONSchema4 {
    oneOf?: JSONSchema4[];
    anyOf?: JSONSchema4[];
}

interface SchemaWithRef extends JSONSchema4 {
    $ref?: string;
}

interface SchemaWithProperties extends JSONSchema4 {
    properties?: Record<string, JSONSchema4>;
    definitions?: Record<string, JSONSchema4 | SchemaWithUnion>;
}

interface ErrorObjectWithParams extends ErrorObject {
    params: Record<string, unknown>;
}

// Type guard functions
function isSchemaWithUnion(schema: unknown): schema is SchemaWithUnion {
    return typeof schema === "object" && schema !== null && ("oneOf" in schema || "anyOf" in schema);
}

function isSchemaWithRef(schema: unknown): schema is SchemaWithRef {
    return typeof schema === "object" && schema !== null && "$ref" in schema;
}

function isSchemaWithProperties(schema: unknown): schema is SchemaWithProperties {
    return typeof schema === "object" && schema !== null;
}

function hasAdditionalProperty(params: unknown): params is { additionalProperty: string } {
    return typeof params === "object" && params !== null && "additionalProperty" in params;
}

function hasMissingProperty(params: unknown): params is { missingProperty: string } {
    return typeof params === "object" && params !== null && "missingProperty" in params;
}

export declare namespace validateAgainstJsonSchema {
    export interface ValidationSuccess {
        success: true;
        data: unknown;
    }

    export interface ValidationFailure {
        success: false;
        error: JsonSchemaError | undefined;
        allErrors: JsonSchemaError[];
    }

    export type JsonSchemaError = ErrorObject;

    export type ValidationResult = ValidationSuccess | ValidationFailure;
}

/**
 * Formats a JSON Pointer path into a readable JSONPath-like string.
 * Decodes JSON Pointer escape sequences (~0 for ~, ~1 for /) and formats
 * array indices with brackets.
 *
 * @param instancePath - JSON Pointer path (e.g., "/person/address/0/city")
 * @param additionalSegment - Optional additional segment to append (e.g., property name)
 * @returns Formatted path (e.g., "$.person.address[0].city")
 */
function formatJsonPath(instancePath: string, additionalSegment?: string): string {
    if (!instancePath && !additionalSegment) {
        return "$";
    }

    const segments = instancePath.split("/").filter((part) => part !== "");
    if (additionalSegment) {
        segments.push(additionalSegment);
    }

    if (segments.length === 0) {
        return "$";
    }

    return (
        "$" +
        segments
            .map((segment) => {
                const decoded = segment.replace(/~1/g, "/").replace(/~0/g, "~");

                if (/^\d+$/.test(decoded)) {
                    return `[${decoded}]`;
                }

                if (/[.[\]']/.test(decoded)) {
                    return `['${decoded.replace(/'/g, "\\'")}']`;
                }

                return `.${decoded}`;
            })
            .join("")
    );
}

/**
 * Gets the type of a value in a way that distinguishes arrays and null.
 */
function getValueType(value: unknown): string {
    if (value === null) {
        return "null";
    }
    if (Array.isArray(value)) {
        return "array";
    }
    return typeof value;
}

/**
 * Attempts to get the actual value at the given JSON path from the payload.
 */
function getValueAtPath(payload: unknown, instancePath: string): unknown {
    try {
        const segments = instancePath.split("/").filter((part) => part !== "");
        let value: unknown = payload;
        for (const segment of segments) {
            const decoded = segment.replace(/~1/g, "/").replace(/~0/g, "~");
            if (Array.isArray(value)) {
                const index = parseInt(decoded, 10);
                if (!isNaN(index)) {
                    value = value[index];
                } else {
                    return undefined;
                }
            } else if (typeof value === "object" && value != null) {
                value = (value as Record<string, unknown>)[decoded];
            } else {
                return undefined;
            }
        }
        return value;
    } catch {
        return undefined;
    }
}

/**
 * Analyzes the actual properties of an object to provide contextual information.
 */
function analyzeObjectProperties(obj: unknown): string {
    if (typeof obj !== "object" || obj === null) {
        return "";
    }

    const actualObj = obj as Record<string, unknown>;
    const properties = Object.keys(actualObj);

    if (properties.length === 0) {
        return " (empty object)";
    }

    return ` (has properties: ${properties.join(", ")})`;
}

/**
 * Counts the property differences between an object and a schema's expected properties.
 * Returns { missing: number, extra: number } where:
 * - missing: number of required properties the object lacks
 * - extra: number of properties the object has that aren't in the schema
 */
function countPropertyDifferences(
    obj: unknown,
    schema: JSONSchema4
): { missing: number; extra: number; total: number } {
    if (typeof obj !== "object" || obj === null || typeof schema !== "object" || schema === null) {
        return { missing: 0, extra: 0, total: 0 };
    }

    const actualObj = obj as Record<string, unknown>;
    const actualProps = new Set(Object.keys(actualObj));

    // Get expected properties from schema
    const expectedProps = new Set<string>();
    const requiredProps = new Set<string>();

    if (schema.properties && typeof schema.properties === "object") {
        Object.keys(schema.properties).forEach((prop) => expectedProps.add(prop));
    }

    if (Array.isArray(schema.required)) {
        schema.required.forEach((prop) => requiredProps.add(prop));
    }

    // Count missing required properties
    let missing = 0;
    for (const prop of requiredProps) {
        if (!actualProps.has(prop)) {
            missing++;
        }
    }

    // Count extra properties (properties in object but not in schema)
    let extra = 0;
    for (const prop of actualProps) {
        if (!expectedProps.has(prop)) {
            extra++;
        }
    }

    return { missing, extra, total: missing + extra };
}

/**
 * Attempts to find the best matching schema from a oneOf/anyOf union based on property differences.
 * Returns the schema that's closest to matching (fewest missing + extra properties).
 * Prioritizes schemas where all required properties are present.
 */
function findBestMatchingSchema(
    obj: unknown,
    unionSchemas: JSONSchema4[]
): { schema: JSONSchema4; differences: { missing: number; extra: number; total: number } } | null {
    if (typeof obj !== "object" || obj === null || !Array.isArray(unionSchemas) || unionSchemas.length === 0) {
        return null;
    }

    let bestMatch: { schema: JSONSchema4; differences: { missing: number; extra: number; total: number } } | null =
        null;

    for (const schema of unionSchemas) {
        // Only consider object schemas with properties
        if (schema.type === "object" && schema.properties) {
            const differences = countPropertyDifferences(obj, schema);

            if (bestMatch === null || isBetterMatch(differences, bestMatch.differences)) {
                bestMatch = { schema, differences };
            }
        }
    }

    return bestMatch;
}

/**
 * Determines if one match is better than another.
 * Prioritizes matches with fewer missing required properties, then fewer total differences.
 */
function isBetterMatch(
    current: { missing: number; extra: number; total: number },
    best: { missing: number; extra: number; total: number }
): boolean {
    // First priority: prefer schemas with no missing required properties
    if (current.missing === 0 && best.missing > 0) {
        return true;
    }
    if (current.missing > 0 && best.missing === 0) {
        return false;
    }

    // Second priority: if both have missing properties, prefer fewer missing
    if (current.missing !== best.missing) {
        return current.missing < best.missing;
    }

    // Third priority: prefer fewer total differences
    return current.total < best.total;
}

/**
 * Determines if one error is better (more informative) than another for user display.
 * Priority order:
 * 1. Deeper path (more specific location)
 * 2. Concrete errors over union errors (anyOf/oneOf)
 * 3. Among concrete errors: additionalProperties > required > type > others
 */
function isBetterError(candidateError: ErrorObject, currentBestError: ErrorObject): boolean {
    const candidatePathDepth = candidateError.instancePath.split("/").length;
    const currentPathDepth = currentBestError.instancePath.split("/").length;

    const candidateIsUnion = candidateError.keyword === "oneOf" || candidateError.keyword === "anyOf";
    const currentIsUnion = currentBestError.keyword === "oneOf" || currentBestError.keyword === "anyOf";

    const candidateScore = getErrorInformativenessScore(candidateError);
    const currentScore = getErrorInformativenessScore(currentBestError);

    // Strong preference for non-union errors over union errors regardless of depth
    if (!candidateIsUnion && currentIsUnion) {
        return true;
    }
    if (candidateIsUnion && !currentIsUnion) {
        return false;
    }

    // For highly informative errors (score >= 9), prefer them even if they're shallower
    // This handles cases where additionalProperties at parent level is more important
    // than const/type errors at child level
    if (candidateScore >= 9 && currentScore < 9) {
        return true;
    }
    if (currentScore >= 9 && candidateScore < 9) {
        return false;
    }

    // If both are highly informative or both are not, prefer deeper path
    if (candidatePathDepth > currentPathDepth) {
        return true;
    }
    if (candidatePathDepth < currentPathDepth) {
        return false;
    }

    // Same depth - compare by error quality
    return candidateScore > currentScore;
}

/**
 * Returns a score indicating how informative an error type is for users.
 * Higher scores are more informative.
 */
function getErrorInformativenessScore(error: ErrorObject): number {
    switch (error.keyword) {
        case "additionalProperties":
            return 10; // Most informative - shows what's wrong
        case "required":
            return 9; // Very informative - shows what's missing
        case "type":
            return 8; // Good - shows type mismatch
        case "enum":
            return 7; // Good - shows invalid value
        case "format":
            return 6; // Moderately informative
        case "pattern":
            return 6; // Moderately informative
        case "const":
            return 4; // Less informative than additionalProperties - usually part of union validation
        case "minimum":
        case "maximum":
        case "minLength":
        case "maxLength":
            return 5; // Moderately informative
        case "oneOf":
        case "anyOf":
            return 3; // Less informative - generic union error
        default:
            return 1; // Fallback for unknown error types
    }
}

/**
 * Appends file path context to an error message if available.
 */
function formatErrorMessageWithFilePath(message: string, filePath?: string): string {
    if (!filePath) {
        return message;
    }

    // Extract the JSON path from the message to create a cleaner file path reference
    const jsonPathMatch = message.match(/at path (\$[^\s]+)/);
    const jsonPath = jsonPathMatch ? jsonPathMatch[1] : "";

    if (jsonPath) {
        // Convert JSON path to instance path for file reference
        // e.g., "$.navigation[0].layout[1]" -> "/navigation/0/layout/1"
        const instancePath = jsonPath
            .replace(/^\$/, "")
            .replace(/\[(\d+)\]/g, "/$1")
            .replace(/\.([^[\]]+)/g, "/$1");

        return `${message} at ${instancePath} (in ${filePath})`;
    }

    return `${message} (in ${filePath})`;
}

/**
 * Creates a suggestion message for the best matching schema.
 */
function createSchemaSuggestion(
    obj: unknown,
    bestMatch: { schema: JSONSchema4; differences: { missing: number; extra: number; total: number } }
): string {
    if (typeof obj !== "object" || obj === null || !bestMatch.schema.properties) {
        return "";
    }

    const actualObj = obj as Record<string, unknown>;
    const actualProps = new Set(Object.keys(actualObj));
    const expectedProps = new Set<string>();
    const requiredProps = new Set<string>();

    if (bestMatch.schema.properties) {
        Object.keys(bestMatch.schema.properties).forEach((prop) => expectedProps.add(prop));
    }

    if (Array.isArray(bestMatch.schema.required)) {
        bestMatch.schema.required.forEach((prop) => requiredProps.add(prop));
    }

    const missingProps: string[] = [];
    const extraProps: string[] = [];

    // Find specific missing required properties
    for (const prop of requiredProps) {
        if (!actualProps.has(prop)) {
            missingProps.push(prop);
        }
    }

    // Find specific extra properties
    for (const prop of actualProps) {
        if (!expectedProps.has(prop)) {
            extraProps.push(prop);
        }
    }

    const suggestions: string[] = [];

    if (missingProps.length > 0) {
        suggestions.push(`add ${missingProps.map((p) => `'${p}'`).join(", ")}`);
    }

    if (extraProps.length > 0) {
        suggestions.push(`remove ${extraProps.map((p) => `'${p}'`).join(", ")}`);
    }

    if (suggestions.length > 0) {
        return `\nDid you mean to ${suggestions.join(" and ")}?`;
    }

    return "";
}

export function validateAgainstJsonSchema(
    payload: unknown,
    schema: JSONSchema4,
    options?: {
        /** Optional file path to include in error messages for better debugging context */
        filePath?: string;
    }
): validateAgainstJsonSchema.ValidationResult {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    const validate = ajv.compile(schema);
    const valid = validate(payload);

    if (valid) {
        return {
            success: true,
            data: payload
        };
    } else if (validate.errors?.[0] != null) {
        try {
            // Find the most relevant error, with improved context awareness
            let mostGranularError = validate.errors[0];

            // Group errors by instance path to analyze patterns
            const errorsByPath = new Map<string, ErrorObject[]>();
            for (const error of validate.errors ?? []) {
                const path = error.instancePath;
                if (!errorsByPath.has(path)) {
                    errorsByPath.set(path, []);
                }
                errorsByPath.get(path)?.push(error);
            }

            // Find the most specific error using a priority-based approach
            // Priority order:
            // 1. Deepest path (most specific location)
            // 2. Concrete errors over union errors
            // 3. additionalProperties errors are most informative
            // 4. required errors are also very informative
            // 5. type errors are moderately informative

            for (const error of validate.errors ?? []) {
                if (isBetterError(error, mostGranularError)) {
                    mostGranularError = error;
                }
            }

            if (mostGranularError.keyword === "additionalProperties") {
                if (!hasAdditionalProperty(mostGranularError.params)) {
                    throw new Error("additionalProperties error missing expected params");
                }
                const additionalProp = mostGranularError.params.additionalProperty;
                const path = formatJsonPath(mostGranularError.instancePath, additionalProp);
                const actualValue = getValueAtPath(payload, mostGranularError.instancePath);
                const propertiesContext = analyzeObjectProperties(actualValue);

                // For union type validation failures, provide more helpful context
                const errorsAtPath = errorsByPath.get(mostGranularError.instancePath) || [];
                const hasUnionErrors = errorsAtPath.some((e) => e.keyword === "oneOf" || e.keyword === "anyOf");

                if (hasUnionErrors && typeof actualValue === "object" && actualValue !== null) {
                    // Try to find the best matching schema and provide helpful suggestions
                    let suggestion = "";

                    // Look for oneOf or anyOf errors to extract the union schemas
                    // First check all errors, not just at the current path
                    const allUnionErrors = (validate.errors ?? []).filter(
                        (e) => e.keyword === "oneOf" || e.keyword === "anyOf"
                    );
                    // Look for union error specifically at the current path
                    const relevantUnionError = allUnionErrors.find(
                        (e) => e.instancePath === mostGranularError.instancePath
                    );

                    if (allUnionErrors.length > 0) {
                        const unionError = relevantUnionError || allUnionErrors[0];
                        let unionSchemas: JSONSchema4[] | null = null;

                        // First try to get schemas from the error object
                        if (unionError?.schema && isSchemaWithUnion(unionError.schema)) {
                            unionSchemas = unionError.schema.oneOf || unionError.schema.anyOf || null;
                        }

                        // If that fails, navigate to the schema using the schemaPath
                        if (!unionSchemas && unionError?.schemaPath) {
                            const pathSegments = unionError.schemaPath.replace("#/", "").split("/");
                            let currentSchema: JSONSchema4 | null = schema;

                            for (const segment of pathSegments) {
                                if (currentSchema && typeof currentSchema === "object" && segment in currentSchema) {
                                    const nextSchema = (currentSchema as Record<string, unknown>)[segment];
                                    if (typeof nextSchema === "object" && nextSchema !== null) {
                                        currentSchema = nextSchema as JSONSchema4;
                                    } else {
                                        currentSchema = null;
                                        break;
                                    }
                                } else {
                                    currentSchema = null;
                                    break;
                                }
                            }

                            if (Array.isArray(currentSchema)) {
                                // Resolve $ref references if needed
                                unionSchemas = currentSchema
                                    .map((schemaItem: unknown) => {
                                        if (isSchemaWithRef(schemaItem) && schemaItem.$ref) {
                                            // Extract reference path (e.g., "#/definitions/docs.ApiReferenceConfiguration")
                                            const refPath = schemaItem.$ref.replace("#/", "").split("/");
                                            let resolvedSchema: JSONSchema4 | null = schema;
                                            for (const refSegment of refPath) {
                                                if (
                                                    resolvedSchema &&
                                                    typeof resolvedSchema === "object" &&
                                                    refSegment in resolvedSchema
                                                ) {
                                                    const nextSchema = (resolvedSchema as Record<string, unknown>)[
                                                        refSegment
                                                    ];
                                                    if (typeof nextSchema === "object" && nextSchema !== null) {
                                                        resolvedSchema = nextSchema as JSONSchema4;
                                                    } else {
                                                        resolvedSchema = null;
                                                        break;
                                                    }
                                                } else {
                                                    resolvedSchema = null;
                                                    break;
                                                }
                                            }
                                            return resolvedSchema;
                                        }
                                        if (typeof schemaItem === "object" && schemaItem !== null) {
                                            return schemaItem as JSONSchema4;
                                        }
                                        return null;
                                    })
                                    .filter((s): s is JSONSchema4 => s !== null); // Remove any null results from failed resolutions
                            }
                        }

                        // Special handling for docs.yml navigation items - directly extract the known union schemas
                        if (!unionSchemas && mostGranularError.instancePath.includes("/navigation/")) {
                            // Try to extract navigation item schemas directly from the schema definitions
                            if (isSchemaWithProperties(schema) && schema.definitions) {
                                const navigationItem = schema.definitions["docs.NavigationItem"];
                                if (isSchemaWithUnion(navigationItem) && navigationItem.anyOf) {
                                    const navItemSchemas = navigationItem.anyOf;
                                    unionSchemas = navItemSchemas
                                        .map((schemaRef: unknown) => {
                                            if (isSchemaWithRef(schemaRef) && schemaRef.$ref) {
                                                const refPath = schemaRef.$ref.replace("#/", "").split("/");
                                                let resolvedSchema: JSONSchema4 | null = schema;
                                                for (const segment of refPath) {
                                                    if (
                                                        resolvedSchema &&
                                                        typeof resolvedSchema === "object" &&
                                                        segment in resolvedSchema
                                                    ) {
                                                        const nextSchema = (resolvedSchema as Record<string, unknown>)[
                                                            segment
                                                        ];
                                                        if (typeof nextSchema === "object" && nextSchema !== null) {
                                                            resolvedSchema = nextSchema as JSONSchema4;
                                                        } else {
                                                            resolvedSchema = null;
                                                            break;
                                                        }
                                                    } else {
                                                        resolvedSchema = null;
                                                        break;
                                                    }
                                                }
                                                return resolvedSchema;
                                            }
                                            if (typeof schemaRef === "object" && schemaRef !== null) {
                                                return schemaRef as JSONSchema4;
                                            }
                                            return null;
                                        })
                                        .filter((s): s is JSONSchema4 => s !== null);
                                }
                            }
                        }

                        if (Array.isArray(unionSchemas)) {
                            const bestMatch = findBestMatchingSchema(actualValue, unionSchemas);
                            if (bestMatch && bestMatch.differences.total <= 2) {
                                // Only suggest if reasonably close
                                suggestion = createSchemaSuggestion(actualValue, bestMatch);
                            }
                        }
                    } else {
                        // If no direct oneOf/anyOf error, check if we're dealing with a oneOf/anyOf in the root schema
                        if (schema.oneOf || schema.anyOf) {
                            const unionSchemas = schema.oneOf || schema.anyOf;
                            if (Array.isArray(unionSchemas)) {
                                const bestMatch = findBestMatchingSchema(actualValue, unionSchemas);
                                if (bestMatch && bestMatch.differences.total <= 2) {
                                    suggestion = createSchemaSuggestion(actualValue, bestMatch);
                                }
                            }
                        }
                    }

                    const errorMessage = `Invalid object at path ${formatJsonPath(mostGranularError.instancePath)}: does not match any allowed schema${propertiesContext}${suggestion}`;
                    return {
                        success: false,
                        error: {
                            ...mostGranularError,
                            message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                        },
                        allErrors: validate.errors ?? []
                    };
                }

                // For additionalProperties errors, suggest what might have been intended
                let suggestion = "";
                if (
                    typeof actualValue === "object" &&
                    actualValue !== null &&
                    schema.type === "object" &&
                    schema.properties
                ) {
                    const differences = countPropertyDifferences(actualValue, schema);
                    if (differences.total <= 2) {
                        // Only suggest if reasonably close
                        const bestMatch = { schema, differences };
                        suggestion = createSchemaSuggestion(actualValue, bestMatch);
                    }
                }

                const errorMessage = `Unexpected property '${additionalProp}' at path ${path}${propertiesContext}${suggestion}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "required") {
                if (!hasMissingProperty(mostGranularError.params)) {
                    throw new Error("required error missing expected params");
                }
                const missingProperty = mostGranularError.params.missingProperty;
                const path = formatJsonPath(mostGranularError.instancePath, missingProperty);
                const actualValue = getValueAtPath(payload, mostGranularError.instancePath);
                const propertiesContext = analyzeObjectProperties(actualValue);

                // For required property errors, suggest what might have been intended
                let suggestion = "";
                if (
                    typeof actualValue === "object" &&
                    actualValue !== null &&
                    schema.type === "object" &&
                    schema.properties
                ) {
                    const differences = countPropertyDifferences(actualValue, schema);
                    if (differences.total <= 2) {
                        // Only suggest if reasonably close
                        const bestMatch = { schema, differences };
                        suggestion = createSchemaSuggestion(actualValue, bestMatch);
                    }
                }

                const errorMessage = `Missing required property '${missingProperty}' at path ${path}${propertiesContext}${suggestion}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "type") {
                const expectedType = Array.isArray(mostGranularError.params.type)
                    ? mostGranularError.params.type.join(" or ")
                    : mostGranularError.params.type;
                const path = formatJsonPath(mostGranularError.instancePath);
                const actualValue = getValueAtPath(payload, mostGranularError.instancePath);
                const actualType = getValueType(actualValue);
                const errorMessage = `Incorrect type at path ${path}: expected ${expectedType} but received ${actualType}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "enum") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Invalid value at path ${path}: must be one of [${mostGranularError.params.allowedValues.join(", ")}]`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "format") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Invalid format at path ${path}: must be a valid ${mostGranularError.params.format}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "pattern") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Invalid format at path ${path}: must match pattern ${mostGranularError.params.pattern}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "oneOf" || mostGranularError.keyword === "anyOf") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const actualValue = getValueAtPath(payload, mostGranularError.instancePath);
                const propertiesContext = analyzeObjectProperties(actualValue);

                // Try to provide suggestions for union type errors
                let suggestion = "";
                if (typeof actualValue === "object" && actualValue !== null) {
                    let unionSchemas: JSONSchema4[] | null = null;

                    // Try to get union schemas from the error
                    if (mostGranularError.schema && isSchemaWithUnion(mostGranularError.schema)) {
                        unionSchemas = mostGranularError.schema.oneOf || mostGranularError.schema.anyOf || null;
                    }

                    // Fallback: if schema has direct oneOf/anyOf, try that
                    if (!unionSchemas && (schema.oneOf || schema.anyOf)) {
                        unionSchemas = schema.oneOf || schema.anyOf || null;
                    }

                    // Navigate to nested schemas if needed (for complex nested structures)
                    if (!unionSchemas && mostGranularError.instancePath) {
                        const pathSegments = mostGranularError.instancePath.split("/").filter((s) => s);
                        let currentSchema = schema;

                        for (const segment of pathSegments) {
                            const decodedSegment = segment.replace(/~1/g, "/").replace(/~0/g, "~");
                            if (currentSchema.properties && currentSchema.properties[decodedSegment]) {
                                currentSchema = currentSchema.properties[decodedSegment] as JSONSchema4;
                            } else if (currentSchema.items && /^\d+$/.test(decodedSegment)) {
                                currentSchema = currentSchema.items as JSONSchema4;
                            } else if (currentSchema.items && typeof currentSchema.items === "object") {
                                currentSchema = currentSchema.items as JSONSchema4;
                            }

                            if (currentSchema.anyOf || currentSchema.oneOf) {
                                unionSchemas = (currentSchema.anyOf || currentSchema.oneOf) as JSONSchema4[] | null;
                                break;
                            }
                        }
                    }

                    if (Array.isArray(unionSchemas)) {
                        const bestMatch = findBestMatchingSchema(actualValue, unionSchemas);
                        if (bestMatch && bestMatch.differences.total <= 2) {
                            suggestion = createSchemaSuggestion(actualValue, bestMatch);
                        }
                    }
                }

                const errorMessage = `Invalid object at path ${path}: does not match any allowed schema${propertiesContext}${suggestion}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "maximum") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Value at path ${path} must be less than or equal to ${mostGranularError.params.limit}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "minimum") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Value at path ${path} must be greater than or equal to ${mostGranularError.params.limit}`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "maxLength") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Value at path ${path} must be no longer than ${mostGranularError.params.limit} characters`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "minLength") {
                const path = formatJsonPath(mostGranularError.instancePath);
                const errorMessage = `Value at path ${path} must be at least ${mostGranularError.params.limit} characters`;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                    },
                    allErrors: validate.errors ?? []
                };
            }
            const path = formatJsonPath(mostGranularError.instancePath);
            const pathSuffix = path !== "$" ? ` at path ${path}` : "";
            const errorMessage = `Validation failed${pathSuffix}`;
            return {
                success: false,
                error: {
                    ...mostGranularError,
                    message: formatErrorMessageWithFilePath(errorMessage, options?.filePath)
                },
                allErrors: validate.errors ?? []
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: "Failed to parse because JSON schema validation failed",
                    ...validate.errors[0]
                },
                allErrors: validate.errors ?? []
            };
        }
    } else {
        return {
            success: false,
            error: undefined,
            allErrors: []
        };
    }
}
