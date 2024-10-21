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
        errors: JsonSchemaError[];
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
    } else {
        return {
            success: false,
            errors: (validate.errors || []).map((error) => ({
                ...error,
                message: getHumanReadableErrorMessage(error)
            }))
        };
    }
}

function getHumanReadableErrorMessage(error: ErrorObject): string {
    if (error.keyword === "additionalProperties") {
        const additionalProperty = error.params.additionalProperty;
        return `Unknown property "${additionalProperty}" found.`;
    }
    if (error.keyword === "const" || error.keyword === "enum") {
        const allowedValues = Array.isArray(error.schema) ? error.schema : [error.schema];
        const quotedValues = allowedValues.map((value) => value === undefined ? "undefined" : `"${value}"`);

        if (quotedValues.length === 1) {
            return `Must be equal to ${quotedValues[0]}`;
        } else if (quotedValues.length === 2) {
            return `Must be equal to ${quotedValues[0]} or ${quotedValues[1]}`;
        } else {
            const lastValue = quotedValues.pop();
            return `Must be equal to ${quotedValues.join(", ")}, or ${lastValue}`;
        }
    }

    // For other error types, use the default message
    return error.message != null ? capitalize(error.message) : "Unknown error";
}
