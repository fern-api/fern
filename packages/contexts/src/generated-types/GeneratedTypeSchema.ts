import { TypeSchemaContext } from "../contexts";
import { GeneratedAliasTypeSchema } from "./GeneratedAliasTypeSchema";
import { GeneratedEnumTypeSchema } from "./GeneratedEnumTypeSchema";
import { GeneratedObjectTypeSchema } from "./GeneratedObjectTypeSchema";
import { GeneratedUnionTypeSchema } from "./GeneratedUnionTypeSchema";

export type GeneratedTypeSchema<Context = TypeSchemaContext> =
    | GeneratedAliasTypeSchema<Context>
    | GeneratedEnumTypeSchema<Context>
    | GeneratedUnionTypeSchema<Context>
    | GeneratedObjectTypeSchema<Context>;
