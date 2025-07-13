import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace ClassInstantiation {
    interface Args {
        /** The class to instantiate */
        classReference: ClassReference;
        /** The arguments passed to the constructor */
        arguments_: AstNode[];
    }
}

export class ClassInstantiation extends AstNode {
    private classReference: ClassReference;
    private arguments_: AstNode[];

    constructor({ classReference, arguments_ }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.classReference);
        writer.write(".");
        writer.write("new");
        writer.write("(");
        this.arguments_.forEach((argument, index) => {
            if (index > 0) {
                writer.write(", ");
            }
            argument.write(writer);
        });
        writer.write(")");
    }
}
