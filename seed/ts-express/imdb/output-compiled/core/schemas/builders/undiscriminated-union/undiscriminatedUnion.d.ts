import { type Schema } from "../../Schema";
import type { inferParsedUnidiscriminatedUnionSchema, inferRawUnidiscriminatedUnionSchema } from "./types";
export declare function undiscriminatedUnion<Schemas extends [Schema<any, any>, ...Schema<any, any>[]]>(schemas: Schemas): Schema<inferRawUnidiscriminatedUnionSchema<Schemas>, inferParsedUnidiscriminatedUnionSchema<Schemas>>;
