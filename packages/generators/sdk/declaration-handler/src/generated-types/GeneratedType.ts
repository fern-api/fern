import { TypeContext } from "../contexts/TypeContext";
import { GeneratedAliasType } from "./GeneratedAliasType";
import { GeneratedEnumType } from "./GeneratedEnumType";
import { GeneratedObjectType } from "./GeneratedObjectType";
import { GeneratedUnionType } from "./GeneratedUnionType";

export type GeneratedType<Context extends TypeContext = TypeContext> =
    | GeneratedAliasType<Context>
    | GeneratedEnumType<Context>
    | GeneratedObjectType<Context>
    | GeneratedUnionType<Context>;
