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
            if (validate.errors?.[0].keyword === "additionalProperties") {
                const additionalProp = validate.errors[0].params.additionalProperty;
                return {
                    success: false,
                    error: {
                        ...validate.errors[0],
                        message: `Encountered unexpected property ${additionalProp}`
                    },
                    allErrors: validate.errors ?? [],
                };
            } else if (validate.errors?.[0].keyword === "required") {
                const missingProperty = validate.errors[0].params.missingProperty;
                return {
                    success: false,
                    error: {
                        ...validate.errors[0],
                        message: `Missing required property '${missingProperty}'`,
                    },
                    allErrors: validate.errors ?? [],
                };
            }
            return {
                success: false,
                error: {
                    ...validate.errors[0],
                    message: "Failed to parse",
                },
                allErrors: validate.errors ?? [],
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: "Failed to parse",
                    ...validate.errors[0],
                },
                allErrors: validate.errors ?? [],
            };
        }
    } else {
        return {
            success: false,
            error: undefined,
            allErrors: [],
        };
    }
}
