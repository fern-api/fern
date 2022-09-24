import { getSchemaUtils } from "../../SchemaUtils";
import {
    BaseObjectLikeSchema,
    getObjectLikeProperties,
    ObjectLikeSchema,
    OBJECT_LIKE_BRAND,
} from "../object/ObjectLikeSchema";
import {
    Discriminant,
    inferParsedDiscriminant,
    inferParsedUnion,
    inferRawDiscriminant,
    inferRawUnion,
    UnionSubtypes,
} from "./types";

export function union<D extends Discriminant, U extends UnionSubtypes<U>>(
    discriminant: D,
    union: U
): ObjectLikeSchema<inferRawUnion<D, U>, inferParsedUnion<D, U>> {
    const rawDiscriminant =
        typeof discriminant === "string" ? discriminant : (discriminant.raw as inferRawDiscriminant<D>);
    const parsedDiscriminant =
        typeof discriminant === "string" ? discriminant : (discriminant.parsed as inferParsedDiscriminant<D>);

    const baseSchema: BaseObjectLikeSchema<inferRawUnion<D, U>, inferParsedUnion<D, U>> = {
        ...OBJECT_LIKE_BRAND,

        parse: (raw, opts) => {
            const { [rawDiscriminant]: discriminantValue, ...remainingFields } = raw;
            const remainingFieldsSchema = union[discriminantValue];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (remainingFieldsSchema == null) {
                return raw as inferParsedUnion<D, U>;
            }

            return {
                [parsedDiscriminant]: discriminantValue,
                ...remainingFieldsSchema.parse(remainingFields, opts),
            } as inferParsedUnion<D, U>;
        },

        json: (parsed, opts) => {
            const { [parsedDiscriminant]: discriminantValue, ...remainingFields } = parsed;
            const remainingFieldsSchema = union[discriminantValue];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (remainingFieldsSchema == null) {
                return parsed as inferRawUnion<D, U>;
            }

            return {
                [rawDiscriminant]: discriminantValue,
                ...remainingFieldsSchema.json(remainingFields, opts),
            } as inferRawUnion<D, U>;
        },
    };

    return {
        ...baseSchema,
        ...getSchemaUtils(baseSchema),
        ...getObjectLikeProperties(baseSchema),
    };
}
