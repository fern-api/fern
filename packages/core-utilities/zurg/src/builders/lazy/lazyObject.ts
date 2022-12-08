import { getObjectUtils } from "../object";
import { getObjectLikeUtils, OBJECT_LIKE_BRAND } from "../object-like";
import { BaseObjectSchema, ObjectSchema } from "../object/types";
import { getSchemaUtils } from "../schema-utils";
import { constructLazyBaseSchema, getMemoizedSchema, SchemaGetter } from "./lazy";

export function lazyObject<Raw, Parsed>(getter: SchemaGetter<ObjectSchema<Raw, Parsed>>): ObjectSchema<Raw, Parsed> {
    const baseSchema: BaseObjectSchema<Raw, Parsed> = {
        ...OBJECT_LIKE_BRAND,
        ...constructLazyBaseSchema(getter),
        _getRawProperties: async () => (await getMemoizedSchema(getter))._getRawProperties(),
        _getParsedProperties: async () => (await getMemoizedSchema(getter))._getParsedProperties(),
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
        ...getObjectUtils(baseSchema),
    };
}
