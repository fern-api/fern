import { type ObjectLikeSchema } from "../object-like";
import type { Discriminant } from "./discriminant";
import type { inferParsedUnion, inferRawUnion, UnionSubtypes } from "./types";
export declare function union<D extends string | Discriminant<any, any>, U extends UnionSubtypes<any>>(discriminant: D, union: U): ObjectLikeSchema<inferRawUnion<D, U>, inferParsedUnion<D, U>>;
