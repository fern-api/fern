import { TypeSchemaContext } from "../contexts";
import { GeneratedAliasTypeSchema } from "./GeneratedAliasTypeSchema";
import { GeneratedEnumTypeSchema } from "./GeneratedEnumTypeSchema";
import { GeneratedObjectTypeSchema } from "./GeneratedObjectTypeSchema";
import { GeneratedUnionTypeSchema } from "./GeneratedUnionTypeSchema";

export type GeneratedTypeSchema<Context extends TypeSchemaContext = TypeSchemaContext> =
    | GeneratedAliasTypeSchema<Context>
    | GeneratedEnumTypeSchema<Context>
    | GeneratedUnionTypeSchema<Context>
    | GeneratedObjectTypeSchema<Context>;
