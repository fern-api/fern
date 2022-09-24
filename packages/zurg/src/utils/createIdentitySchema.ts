import { BaseSchema, Schema } from "../Schema";
import { getSchemaUtils } from "../SchemaUtils";

export function createIdentitySchemaCreator<T>(): () => Schema<T, T> {
    const baseSchema: BaseSchema<T, T> = {
        parse: (raw) => raw,
        json: (parsed) => parsed,
    };

    const schema: Schema<T, T> = {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };

    return () => schema;
}
