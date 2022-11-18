import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

type Getter<Raw, Parsed> = () => Schema<Raw, Parsed> | Promise<Schema<Raw, Parsed>>;
type MemoizedGetter<Raw, Parsed> = Getter<Raw, Parsed> & { __zurg_memoized?: Schema<Raw, Parsed> };

export function lazy<Raw, Parsed>(getter: Getter<Raw, Parsed>): Schema<Raw, Parsed> {
    const baseSchema = constructLazyBaseSchema(getter);
    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

export function constructLazyBaseSchema<Raw, Parsed>(getter: Getter<Raw, Parsed>): BaseSchema<Raw, Parsed> {
    const getSchema = async () => {
        const castedGetter = getter as MemoizedGetter<Raw, Parsed>;
        if (castedGetter.__zurg_memoized == null) {
            castedGetter.__zurg_memoized = await getter();
        }
        return castedGetter.__zurg_memoized;
    };

    return {
        parse: async (raw) => (await getSchema()).parse(raw),
        json: async (parsed) => (await getSchema()).json(parsed),
    };
}
