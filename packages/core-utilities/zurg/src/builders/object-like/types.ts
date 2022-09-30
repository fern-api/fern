import { BaseSchema, Schema } from "../../Schema";

export type ObjectLikeSchema<Raw, Parsed> = Schema<Raw, Parsed> &
    BaseObjectLikeSchema<Raw, Parsed> &
    ObjectLikeUtils<Raw, Parsed>;

export type BaseObjectLikeSchema<Raw, Parsed> = BaseSchema<Raw, Parsed> & {
    _objectLike: void;
};

export interface ObjectLikeUtils<Raw, Parsed> {
    withProperties: <T extends Record<string, any>>(properties: {
        [K in keyof T]: T[K] | ((parsed: Parsed) => T[K]);
    }) => ObjectLikeSchema<Raw, Parsed & T>;
}

export const OBJECT_LIKE_BRAND = undefined as unknown as { _objectLike: void };
