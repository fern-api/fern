import { BaseContext } from "../../base-context";
import { GeneratedAliasTypeSchema } from "./GeneratedAliasTypeSchema";
import { GeneratedEnumTypeSchema } from "./GeneratedEnumTypeSchema";
import { GeneratedObjectTypeSchema } from "./GeneratedObjectTypeSchema";
import { GeneratedUndiscriminatedUnionTypeSchema } from "./GeneratedUndiscriminatedUnionTypeSchema";
import { GeneratedUnionTypeSchema } from "./GeneratedUnionTypeSchema";

export type GeneratedTypeSchema<Context = BaseContext> =
    | GeneratedAliasTypeSchema<Context>
    | GeneratedEnumTypeSchema<Context>
    | GeneratedUnionTypeSchema<Context>
    | GeneratedUndiscriminatedUnionTypeSchema<Context>
    | GeneratedObjectTypeSchema<Context>;
