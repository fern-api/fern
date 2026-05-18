import type * as SeedApi from "../../../index.mjs";
export type JsonLike = SeedApi.circularReferences.JsonLike[] | {
    [key: string]: JsonLike;
} | string | number | boolean;
