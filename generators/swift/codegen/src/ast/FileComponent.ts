import { Class } from "./Class";
import { Comment } from "./Comment";
import { EnumWithAssociatedValues } from "./EnumWithAssociatedValues";
import { EnumWithRawValues } from "./EnumWithRawValues";
import { LineBreak } from "./LineBreak";
import { Statement } from "./Statement";
import { Struct } from "./Struct";

export type FileComponent =
    | Class
    | Comment
    | EnumWithAssociatedValues
    | EnumWithRawValues
    | LineBreak
    | Statement
    | Struct;
