import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../schema-utils";

type Getter<Raw, Parsed> = () => Schema<Raw, Parsed>;
type MemoizedGetter<Raw, Parsed> = Getter<Raw, Parsed> & { __zurg_memoized?: Schema<Raw, Parsed> };

export function lazy<Raw, Parsed>(getter: Getter<Raw, Parsed>): Schema<Raw, Parsed> {
    const baseSchema = constructLazyBaseSchema(getter);
    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
    };
}

export function constructLazyBaseSchema<Raw, Parsed>(getter: Getter<Raw, Parsed>): BaseSchema<Raw, Parsed> {
    const getSchema = () => {
        const castedGetter = getter as MemoizedGetter<Raw, Parsed>;
        if (castedGetter.__zurg_memoized == null) {
            castedGetter.__zurg_memoized = getter();
        }
        return castedGetter.__zurg_memoized;
    };

    return {
        parse: (raw) => getSchema().parse(raw),
        json: (parsed) => getSchema().json(parsed),
    };
}
