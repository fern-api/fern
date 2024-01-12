import { AstNode } from "../AstNode";
import { Hash_ } from "../primitives/Hash_";

export declare namespace Enum {
    export interface Init extends AstNode.Init {
        contents: Map<string, string>;
    }
}

// TODO: allow for per-enum documentation
export class Enum extends Hash_ {
    constructor({ contents, documentation }: Enum.Init) {
        super({ keyType: "string", valueType: "string", contents, isFrozen: true, documentation });
    }
}
