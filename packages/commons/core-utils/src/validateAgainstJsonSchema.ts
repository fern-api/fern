import Ajv, { ErrorObject } from "ajv";
import { JSONSchema4 } from "json-schema";

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

export function validateAgainstJsonSchema(
    payload: unknown,
    schema: JSONSchema4
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
            // Find the most relevant error, filtering out unhelpful oneOf errors
            let mostGranularError = validate.errors[0];

            // Find the most specific error by prioritizing non-oneOf/anyOf errors
            // and using instancePath length as a tiebreaker
            for (const error of validate.errors ?? []) {
                const currentIsOneOf = error.keyword === "oneOf" || error.keyword === "anyOf";
                const existingIsOneOf = mostGranularError.keyword === "oneOf" || mostGranularError.keyword === "anyOf";

                // Prefer non-oneOf errors over oneOf errors
                if (!currentIsOneOf && existingIsOneOf) {
                    mostGranularError = error;
                }
                // If both are oneOf or both are non-oneOf, use the longer path
                else if (
                    currentIsOneOf === existingIsOneOf &&
                    error.instancePath.length > mostGranularError.instancePath.length
                ) {
                    mostGranularError = error;
                }
            }

            if (mostGranularError.keyword === "additionalProperties") {
                const additionalProp = mostGranularError.params.additionalProperty;
                const path = formatJsonPath(mostGranularError.instancePath, additionalProp);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Unexpected property '${additionalProp}' at path ${path}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "required") {
                const missingProperty = mostGranularError.params.missingProperty;
                const path = formatJsonPath(mostGranularError.instancePath, missingProperty);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Missing required property '${missingProperty}' at path ${path}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "type") {
                const expectedType = mostGranularError.params.type;
                const path = formatJsonPath(mostGranularError.instancePath);
                let actualType = "unknown";
                try {
                    const segments = mostGranularError.instancePath.split("/").filter((part) => part !== "");
                    let value: unknown = payload;
                    for (const segment of segments) {
                        const decoded = segment.replace(/~1/g, "/").replace(/~0/g, "~");
                        value = (value as Record<string, unknown>)?.[decoded];
                    }
                    actualType = getValueType(value);
                } catch {
                    actualType = "unknown";
                }
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Incorrect type at path ${path}: expected ${expectedType} but received ${actualType}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "enum") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Invalid value at path ${path}: must be one of [${mostGranularError.params.allowedValues.join(", ")}]`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "format") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Invalid format at path ${path}: must be a valid ${mostGranularError.params.format}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "pattern") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Invalid format at path ${path}: must match pattern ${mostGranularError.params.pattern}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "maximum") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Value at path ${path} must be less than or equal to ${mostGranularError.params.limit}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "minimum") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Value at path ${path} must be greater than or equal to ${mostGranularError.params.limit}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "maxLength") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Value at path ${path} must be no longer than ${mostGranularError.params.limit} characters`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "minLength") {
                const path = formatJsonPath(mostGranularError.instancePath);
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Value at path ${path} must be at least ${mostGranularError.params.limit} characters`
                    },
                    allErrors: validate.errors ?? []
                };
            }
            const path = formatJsonPath(mostGranularError.instancePath);
            const pathSuffix = path !== "$" ? ` at path ${path}` : "";
            return {
                success: false,
                error: {
                    ...mostGranularError,
                    message: `Validation failed${pathSuffix}`
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
