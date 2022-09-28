import { getObjectUtils, PropertySchemas } from "../object";
import { getObjectLikeUtils, OBJECT_LIKE_BRAND } from "../object-like";
import {
    BaseObjectSchema,
    inferObjectSchemaFromPropertySchemas,
    inferParsedObjectFromPropertySchemas,
    inferRawObjectFromPropertySchemas,
} from "../object/types";
import { getSchemaUtils } from "../schema-utils";

export function lazyObject<T extends PropertySchemas<keyof T>>(
    getter: () => inferObjectSchemaFromPropertySchemas<T>
): inferObjectSchemaFromPropertySchemas<T> {
    const baseSchema: BaseObjectSchema<
        inferRawObjectFromPropertySchemas<T>,
        inferParsedObjectFromPropertySchemas<T>
    > = {
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
