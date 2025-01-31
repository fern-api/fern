import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace File {
    interface Args {
        /* The list of nodes in the file. */
        nodes?: AstNode[];
    }
}

export class File extends AstNode {
    public readonly nodes: AstNode[];

    constructor({ nodes }: File.Args = { nodes: [] }) {
        super();
        this.nodes = nodes ?? [];
    }

    public add(...nodes: AstNode[]): void {
        this.nodes.push(...nodes);
    }

    public write(writer: Writer): void {
        for (const node of this.nodes) {
            node.write(writer);
        }
    }
}
