import { BaseContext } from "../../base-context";
import { GeneratedAliasType } from "./GeneratedAliasType";
import { GeneratedEnumType } from "./GeneratedEnumType";
import { GeneratedObjectType } from "./GeneratedObjectType";
import { GeneratedUndiscriminatedUnionType } from "./GeneratedUndiscriminatedUnionType";
import { GeneratedUnionType } from "./GeneratedUnionType";

export type GeneratedType<Context = BaseContext> =
    | GeneratedAliasType<Context>
    | GeneratedEnumType<Context>
    | GeneratedObjectType<Context>
    | GeneratedUnionType<Context>
    | GeneratedUndiscriminatedUnionType<Context>;
