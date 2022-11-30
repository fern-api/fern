import { TypeContext } from "../contexts";
import { GeneratedAliasType } from "./GeneratedAliasType";
import { GeneratedEnumType } from "./GeneratedEnumType";
import { GeneratedObjectType } from "./GeneratedObjectType";
import { GeneratedUnionType } from "./GeneratedUnionType";

export type GeneratedType<Context = TypeContext> =
    | GeneratedAliasType<Context>
    | GeneratedEnumType<Context>
    | GeneratedObjectType<Context>
    | GeneratedUnionType<Context>;
