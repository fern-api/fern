import { BaseSchema, Schema } from "../../Schema";
import { getSchemaUtils } from "../../SchemaUtils";

export type ObjectLikeSchema<Raw, Parsed> = Schema<Raw, Parsed> &
    BaseObjectLikeSchema<Raw, Parsed> &
    ObjectLikeUtils<Raw, Parsed>;

export type BaseObjectLikeSchema<Raw, Parsed> = BaseSchema<Raw, Parsed> & {
    _objectLike: void;
};

export interface ObjectLikeUtils<Raw, Parsed> {
    withProperties: <T>(properties: T | ((parsed: Parsed) => T)) => ObjectLikeSchema<Raw, Parsed & T>;
}

export function getObjectLikeProperties<Raw, Parsed>(
    schema: BaseObjectLikeSchema<Raw, Parsed>
): ObjectLikeUtils<Raw, Parsed> {
    return {
        withProperties: (properties) => withProperties(schema, properties),
    };
}

export const OBJECT_LIKE_BRAND = undefined as unknown as { _objectLike: void };

function withProperties<RawObjectShape, ParsedObjectShape, Properties>(
    objectLike: BaseObjectLikeSchema<RawObjectShape, ParsedObjectShape>,
    properties: Properties | ((parsed: ParsedObjectShape) => Properties)
): ObjectLikeSchema<RawObjectShape, ParsedObjectShape & Properties> {
    const objectSchema: BaseObjectLikeSchema<RawObjectShape, ParsedObjectShape & Properties> = {
        ...OBJECT_LIKE_BRAND,
        parse: (raw, opts) => {
            const parsedObject = objectLike.parse(raw, opts);
            const additionalProperties =
                typeof properties === "function"
                    ? (properties as (parsed: ParsedObjectShape) => Properties)(parsedObject)
                    : properties;
            return {
                ...parsedObject,
                ...additionalProperties,
            };
        },
        json: (parsed, opts) => objectLike.json(parsed, opts),
    };

    return {
        ...objectSchema,
        ...getSchemaUtils(objectSchema),
        ...getObjectLikeProperties(objectSchema),
    };
}
