import { getObjectUtils } from "../object/index.js";
import { getObjectLikeUtils } from "../object-like/index.js";
import { BaseObjectSchema, ObjectSchema } from "../object/types.js";
import { getSchemaUtils } from "../schema-utils/index.js";
import { SchemaGetter, constructLazyBaseSchema, getMemoizedSchema } from "./lazy.js";

export function lazyObject<Raw, Parsed>(getter: SchemaGetter<ObjectSchema<Raw, Parsed>>): ObjectSchema<Raw, Parsed> {
    const baseSchema: BaseObjectSchema<Raw, Parsed> = {
        ...constructLazyBaseSchema(getter),
        _getRawProperties: () => getMemoizedSchema(getter)._getRawProperties(),
        _getParsedProperties: () => getMemoizedSchema(getter)._getParsedProperties(),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
        ...getObjectUtils(baseSchema),
    };
}
