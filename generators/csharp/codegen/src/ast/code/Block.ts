import { type Generation } from "../../context/generation-info.js";
import { is } from "../../utils/type-guards.js";
import { AstNode } from "../core/AstNode.js";
import { Writer } from "../core/Writer.js";
import { CodeBlock } from "../language/CodeBlock.js";
import { NamedNode, Statement } from "../language/Expression.js";
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
    /*
    // 
    var(name: string, type: ClassReference | Type, initialValue?: Expression): Local;
    var(name: string, initialValue: Expression);
    var(name: string, typeOrInitialValue: Expression | ClassReference | Type, initialValue?: Expression) {
        if (type) {
            this.statements.push([type, " ", name]);
        }
    }
    */
    if(condition: string, block: Block) {
        //
    }
}
