import { AstNode } from "../AstNode";
import { HashInstance } from "../primitives/Hash_";

export declare namespace Enum {
    export interface Init extends AstNode.Init {
        contents: Map<string, string>;
    }
}

// TODO: allow for per-enum documentation
export class Enum extends HashInstance {
    constructor({ contents, documentation }: Enum.Init) {
        super({ contents, isFrozen: true, documentation });
    }
}
