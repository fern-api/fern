import Ajv, { ErrorObject } from 'ajv';
import { JSONSchema4 } from 'json-schema';

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


export function validateAgainstJsonSchema(payload: unknown, schema: JSONSchema4): validateAgainstJsonSchema.ValidationResult {
  const ajv = new Ajv({ allErrors: true });
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
      errors: validate.errors || []
    };
  }
}
