import { Class } from "./Class";
import { Comment } from "./Comment";
import { EnumWithAssociatedValues } from "./EnumWithAssociatedValues";
import { EnumWithRawValues } from "./EnumWithRawValues";
import { Extension } from "./Extension";
import { LineBreak } from "./LineBreak";
import { Statement } from "./Statement";
import { Struct } from "./Struct";

export type FileComponent =
    | Class
    | Comment
    | EnumWithAssociatedValues
    | EnumWithRawValues
    | Extension
    | LineBreak
    | Statement
    | Struct
    | string;
