import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace MultiNode {
    interface Args {
        nodes: AstNode[];
    }
}

export class MultiNode extends AstNode {
    public readonly nodes: AstNode[];

    constructor({ nodes }: MultiNode.Args) {
        super();
        this.nodes = nodes;
    }

    public write(writer: Writer): void {
        for (const node of this.nodes) {
            writer.newLine();
            node.write(writer);
            writer.newLine();
        }
    }
}
