import { Ternary as CommonTernary } from "@fern-api/base-generator";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace Ternary {
    type Args = CommonTernary.Args;
}

export class Ternary extends AstNode {
    private args: Ternary.Args;

    public constructor(args: Ternary.Args) {
        super();
        this.args = args;
    }

    public write(writer: Writer): void {
        const commonTernary = new CommonTernary(this.args);
        return commonTernary.write(writer);
    }
}
