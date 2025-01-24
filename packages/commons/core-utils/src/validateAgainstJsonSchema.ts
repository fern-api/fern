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
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Encountered unexpected property ${additionalProp}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "required") {
                const missingProperty = mostGranularError.params.missingProperty;
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Missing required property '${missingProperty}'`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "enum") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Invalid value: must be one of [${mostGranularError.params.allowedValues.join(", ")}]`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "format") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Invalid format: must be a valid ${mostGranularError.params.format}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "pattern") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Invalid format: must match pattern ${mostGranularError.params.pattern}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "maximum") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Value must be less than or equal to ${mostGranularError.params.limit}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "minimum") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Value must be greater than or equal to ${mostGranularError.params.limit}`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "maxLength") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Must be no longer than ${mostGranularError.params.limit} characters`
                    },
                    allErrors: validate.errors ?? []
                };
            } else if (mostGranularError.keyword === "minLength") {
                return {
                    success: false,
                    error: {
                        ...mostGranularError,
                        message: `Must be at least ${mostGranularError.params.limit} characters`
                    },
                    allErrors: validate.errors ?? []
                };
            }
            return {
                success: false,
                error: {
                    ...mostGranularError,
                    message: "Failed to parse because JSON schema validation failed"
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
