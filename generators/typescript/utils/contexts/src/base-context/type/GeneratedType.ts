import { BaseContext } from "../../base-context/index.js";
import { GeneratedAliasType } from "./GeneratedAliasType.js";
import { GeneratedEnumType } from "./GeneratedEnumType.js";
import { GeneratedObjectType } from "./GeneratedObjectType.js";
import { GeneratedUndiscriminatedUnionType } from "./GeneratedUndiscriminatedUnionType.js";
import { GeneratedUnionType } from "./GeneratedUnionType.js";

export type GeneratedType<Context = BaseContext> =
    | GeneratedAliasType<Context>
    | GeneratedEnumType<Context>
    | GeneratedObjectType<Context>
    | GeneratedUnionType<Context>
    | GeneratedUndiscriminatedUnionType<Context>;
