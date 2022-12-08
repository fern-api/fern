import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

export type SchemaGetter<SchemaType extends Schema<any, any>> = () => SchemaType | Promise<SchemaType>;

export function lazy<Raw, Parsed>(getter: SchemaGetter<Schema<Raw, Parsed>>): Schema<Raw, Parsed> {
    const baseSchema = constructLazyBaseSchema(getter);
    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

export function constructLazyBaseSchema<Raw, Parsed>(
    getter: SchemaGetter<Schema<Raw, Parsed>>
): BaseSchema<Raw, Parsed> {
    return {
        parse: async (raw) => (await getMemoizedSchema(getter)).parse(raw),
        json: async (parsed) => (await getMemoizedSchema(getter)).json(parsed),
    };
}

type MemoizedGetter<SchemaType extends Schema<any, any>> = SchemaGetter<SchemaType> & { __zurg_memoized?: SchemaType };

export async function getMemoizedSchema<SchemaType extends Schema<any, any>>(
    getter: SchemaGetter<SchemaType>
): Promise<SchemaType> {
    const castedGetter = getter as MemoizedGetter<SchemaType>;
    if (castedGetter.__zurg_memoized == null) {
        castedGetter.__zurg_memoized = await getter();
    }
    return castedGetter.__zurg_memoized;
}
