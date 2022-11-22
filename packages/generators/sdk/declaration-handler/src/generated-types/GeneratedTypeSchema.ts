import { GeneratedAliasTypeSchema } from "./GeneratedAliasTypeSchema";
import { GeneratedEnumTypeSchema } from "./GeneratedEnumTypeSchema";
import { GeneratedObjectTypeSchema } from "./GeneratedObjectTypeSchema";
import { GeneratedUnionTypeSchema } from "./GeneratedUnionTypeSchema";

export type GeneratedTypeSchema =
    | GeneratedAliasTypeSchema
    | GeneratedEnumTypeSchema
    | GeneratedUnionTypeSchema
    | GeneratedObjectTypeSchema;
