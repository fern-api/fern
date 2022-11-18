import { BaseObjectLikeSchema, getObjectLikeUtils, ObjectLikeSchema, OBJECT_LIKE_BRAND } from "../object-like";
import { getSchemaUtils } from "../schema-utils";
import { Discriminant } from "./discriminant";
import { inferParsedDiscriminant, inferParsedUnion, inferRawDiscriminant, inferRawUnion, UnionSubtypes } from "./types";

export function union<D extends string | Discriminant<any, any>, U extends UnionSubtypes<any>>(
    discriminant: D,
    union: U
): ObjectLikeSchema<inferRawUnion<D, U>, inferParsedUnion<D, U>> {
    const rawDiscriminant =
        typeof discriminant === "string" ? discriminant : (discriminant.rawDiscriminant as inferRawDiscriminant<D>);
    const parsedDiscriminant =
        typeof discriminant === "string"
            ? discriminant
            : (discriminant.parsedDiscriminant as inferParsedDiscriminant<D>);

    const baseSchema: BaseObjectLikeSchema<inferRawUnion<D, U>, inferParsedUnion<D, U>> = {
        ...OBJECT_LIKE_BRAND,

        parse: async (raw, opts) => {
            const { [rawDiscriminant]: discriminantValue, ...additionalProperties } = raw;
            const additionalPropertySchemas = union[discriminantValue];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (additionalPropertySchemas == null) {
                return {
                    ...additionalProperties,
                    [parsedDiscriminant]: discriminantValue,
                } as inferParsedUnion<D, U>;
            }

            return {
                ...(await additionalPropertySchemas.parse(additionalProperties, opts)),
                [parsedDiscriminant]: discriminantValue,
            } as inferParsedUnion<D, U>;
        },

        json: async (parsed, opts) => {
            const { [parsedDiscriminant]: discriminantValue, ...additionalProperties } = parsed;
            const additionalPropertySchemas = union[discriminantValue];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (additionalPropertySchemas == null) {
                return {
                    ...additionalProperties,
                    [rawDiscriminant]: discriminantValue,
                } as unknown as inferRawUnion<D, U>;
            }

            return {
                ...(await additionalPropertySchemas.json(additionalProperties, opts)),
                [rawDiscriminant]: discriminantValue,
            } as inferRawUnion<D, U>;
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeUtils(baseSchema),
    };
}
