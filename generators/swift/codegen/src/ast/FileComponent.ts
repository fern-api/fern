import { Class } from "./Class.js";
import { Comment } from "./Comment.js";
import { EnumWithAssociatedValues } from "./EnumWithAssociatedValues.js";
import { EnumWithRawValues } from "./EnumWithRawValues.js";
import { Extension } from "./Extension.js";
import { LineBreak } from "./LineBreak.js";
import { Statement } from "./Statement.js";
import { Struct } from "./Struct.js";

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
