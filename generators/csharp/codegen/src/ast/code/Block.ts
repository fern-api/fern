import { type Generation } from "../../context/generation-info";
import { is } from "../../utils/type-guards";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { CodeBlock } from "../language/CodeBlock";
import { NamedNode, Statement } from "../language/Expression";
export declare namespace Block {
    interface Args {}
}

export class Block extends AstNode {
    private statements: Statement[] = [];

    constructor(args: Block.Args, generation: Generation) {
        super(generation);
    }

    public write(writer: Writer): void {
        for (const each of this.statements) {
            if (is.string(each)) {
                writer.writeStatement(each);
                continue;
            }

            if (each instanceof CodeBlock) {
                each.write(writer);
                continue;
            }

            writer.writeStatement(...each);
        }
    }

    append(codeblock: CodeBlock) {
        this.statements.push(codeblock);
    }

    assign(to: NamedNode, from: NamedNode | AstNode): this {
        if (is.Ast.NamedNode(from)) {
            this.statements.push([`${to.name} = ${from.name}`]);
        } else {
            this.statements.push([to.name, ` = `, from]);
        }

        return this;
    }
}
