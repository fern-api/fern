import type * as SeedApi from "../../../index.mjs";
export type JsonLikeWithNullAndUndefined = (SeedApi.circularReferences.JsonLikeWithNullAndUndefined | null)[] | {
    [key: string]: JsonLikeWithNullAndUndefined;
} | string | null | number | null | boolean | null;
