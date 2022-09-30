import { getObjectUtils } from "../object";
import { getObjectLikeUtils, OBJECT_LIKE_BRAND } from "../object-like";
import { ObjectSchema } from "../object/types";
import { getSchemaUtils } from "../schema-utils";
import { constructLazyBaseSchema } from "./lazy";

export function lazyObject<Raw, Parsed>(getter: () => ObjectSchema<Raw, Parsed>): ObjectSchema<Raw, Parsed> {
    const baseSchema = {
        ...OBJECT_LIKE_BRAND,
        ...constructLazyBaseSchema(getter),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
        ...getObjectUtils(baseSchema),
    };
}
