import { BaseSchema, MaybeValid, Schema, SchemaOptions, SchemaType } from "../Schema.js";
import { getSchemaUtils } from "../builders/schema-utils/index.js";
import { maybeSkipValidation } from "./maybeSkipValidation.js";

export function createIdentitySchemaCreator<T>(
    schemaType: SchemaType,
    validate: (value: unknown, opts?: SchemaOptions) => MaybeValid<T>,
): () => Schema<T, T> {
    return () => {
        const baseSchema: BaseSchema<T, T> = {
            parse: validate,
            json: validate,
            getType: () => schemaType,
        };

        return {
            ...maybeSkipValidation(baseSchema),
            ...getSchemaUtils(baseSchema),
        };
    };
}
