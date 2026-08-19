import { Ternary as CommonTernary } from "@fern-api/browser-compatible-base-generator";
import { type Generation } from "../../context/generation-info.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";

export declare namespace Ternary {
    type Args = CommonTernary.Args;
}

export class Ternary extends AstNode {
    private args: Ternary.Args;

    public constructor(args: Ternary.Args, generation: Generation) {
        super(generation);
        this.args = args;
    }

    public write(writer: Writer): void {
        const commonTernary = new CommonTernary(this.args);
        return commonTernary.write(writer);
    }
}
