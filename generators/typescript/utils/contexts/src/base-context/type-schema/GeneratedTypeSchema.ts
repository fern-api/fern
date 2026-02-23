import { BaseContext } from "../../base-context/index.js";
import { GeneratedAliasTypeSchema } from "./GeneratedAliasTypeSchema.js";
import { GeneratedEnumTypeSchema } from "./GeneratedEnumTypeSchema.js";
import { GeneratedObjectTypeSchema } from "./GeneratedObjectTypeSchema.js";
import { GeneratedUndiscriminatedUnionTypeSchema } from "./GeneratedUndiscriminatedUnionTypeSchema.js";
import { GeneratedUnionTypeSchema } from "./GeneratedUnionTypeSchema.js";

export type GeneratedTypeSchema<Context = BaseContext> =
    | GeneratedAliasTypeSchema<Context>
    | GeneratedEnumTypeSchema<Context>
    | GeneratedUnionTypeSchema<Context>
    | GeneratedUndiscriminatedUnionTypeSchema<Context>
    | GeneratedObjectTypeSchema<Context>;
