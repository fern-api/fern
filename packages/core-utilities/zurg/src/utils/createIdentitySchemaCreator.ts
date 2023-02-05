import { getSchemaUtils } from "../builders/schema-utils";
import { BaseSchema, MaybeValid, Schema, SchemaOptions, SchemaType } from "../Schema";

export function createIdentitySchemaCreator<T>(
    schemaType: SchemaType,
    validate: (value: unknown, opts?: SchemaOptions) => MaybeValid<T>
): () => Schema<T, T> {
    return () => {
        const baseSchema: BaseSchema<T, T> = {
            parse: validate,
            json: validate,
            getType: () => schemaType,
        };

        return {
            ...baseSchema,
            ...getSchemaUtils(baseSchema),
        };
    };
}
