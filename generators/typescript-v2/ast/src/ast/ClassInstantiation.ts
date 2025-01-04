import { Reference } from "./Reference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassInstantiation {
    interface Args {
        class_: Reference;
        arguments_: AstNode[];
    }
}

export class ClassInstantiation extends AstNode {
    private class_: Reference;
    private arguments_: AstNode[];

    constructor({ class_, arguments_ }: ClassInstantiation.Args) {
        super();
        this.class_ = class_;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.write("new ");
        writer.writeNode(this.class_);
        writer.write("(");
        writer.delimit({
            nodes: this.arguments_,
            delimiter: ", ",
            writeFunction: (argument) => argument.write(writer)
        });
        writer.write(")");
    }
}
