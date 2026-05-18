import type * as SeedApi from "../../../index.js";
export type JsonLikeWithNullAndUndefined = (SeedApi.circularReferences.JsonLikeWithNullAndUndefined | null)[] | {
    [key: string]: JsonLikeWithNullAndUndefined;
} | string | null | number | null | boolean | null;
