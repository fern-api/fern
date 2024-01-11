import { AstNode } from "../../AstNode";
import { Hash } from "../primitives/Hash";

export declare namespace Enum {
    export interface Init extends AstNode.Init {
        contents?: Map<string, string>;
    }
}

export class Enum extends Hash {
    constructor({ contents, documentation }: Enum.Init) {
        super("string", "string", contents, true, documentation);
    }
}
