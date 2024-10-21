import Ajv, { ErrorObject } from "ajv";
import { JSONSchema4 } from "json-schema";
import { AggregateAjvError } from "@segment/ajv-human-errors";
import { capitalize } from "lodash-es";

export declare namespace validateAgainstJsonSchema {
    export interface ValidationSuccess {
        success: true;
        data: unknown;
    }

    export interface ValidationFailure {
        success: false;
        error: JsonSchemaError | undefined;
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
            const aggregateAjvError = new AggregateAjvError(validate.errors ?? []);
            return {
                success: false,
                error: {
                    ...validate.errors?.[0],
                    message: aggregateAjvError.message ?? validate.errors?.[0].message
                }
            };
        } catch (error) {
            // Handle "must NOT have additional properties" error
            if (validate.errors?.[0].keyword === "additionalProperties") {
                const additionalProp = validate.errors[0].params.additionalProperty;
                return {
                    success: false,
                    error: {
                        ...validate.errors[0],
                        message: `Encountered unexpected property ${additionalProp}`
                    }
                };
            }
            return {
                success: false,
                error: validate.errors?.[0]
            };
        }
    } else {
        return {
            success: false,
            error: undefined
        };
    }
}
