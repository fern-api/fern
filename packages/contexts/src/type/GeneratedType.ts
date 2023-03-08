import { GeneratedAliasType } from "./GeneratedAliasType";
import { GeneratedEnumType } from "./GeneratedEnumType";
import { GeneratedObjectType } from "./GeneratedObjectType";
import { GeneratedUndiscriminatedUnionType } from "./GeneratedUndiscriminatedUnionType";
import { GeneratedUnionType } from "./GeneratedUnionType";
import { TypeContext } from "./TypeContext";

export type GeneratedType<Context = TypeContext> =
    | GeneratedAliasType<Context>
    | GeneratedEnumType<Context>
    | GeneratedObjectType<Context>
    | GeneratedUnionType<Context>
    | GeneratedUndiscriminatedUnionType<Context>;
