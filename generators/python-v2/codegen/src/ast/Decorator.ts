import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";
import { BaseInvocation } from "./BaseInvocation";
import { MethodInvocation } from "./MethodInvocation";
import { ClassInstantiation } from "./ClassInstantiation";

export declare namespace Decorator {
    interface Args {
        callable: AstNode;
    }
}

export class Decorator extends AstNode {
    private callable: AstNode;

    constructor({ callable }: Decorator.Args) {
        super();
        this.callable = callable;
        this.inheritReferences(callable);
    }

    public write(writer: Writer): void {
        writer.write("@");
        this.callable.write(writer);
        writer.newLine();
    }
}
