import { getObjectUtils } from "../object";
import { getObjectLikeUtils, OBJECT_LIKE_BRAND } from "../object-like";
import { BaseObjectSchema, ObjectSchema } from "../object/types";
import { getSchemaUtils } from "../schema-utils";

export function lazyObject<Raw, Parsed>(getter: () => ObjectSchema<Raw, Parsed>): ObjectSchema<Raw, Parsed> {
    const baseSchema: BaseObjectSchema<Raw, Parsed> = {
        ...OBJECT_LIKE_BRAND,
        parse: (raw, opts) => getter().parse(raw, opts),
        json: (parsed, opts) => getter().json(parsed, opts),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
        ...getObjectUtils(baseSchema),
    };
}
