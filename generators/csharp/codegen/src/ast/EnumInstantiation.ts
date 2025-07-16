import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace EnumInstantiation {
    interface Args {
        reference: ClassReference;
        value: string;
    }
}

export class EnumInstantiation extends AstNode {
    private reference: ClassReference;
    private value: string;

    constructor({ reference, value }: EnumInstantiation.Args) {
        super();
        this.reference = reference;
        this.value = value;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.reference);
        writer.write(`.${this.value}`);
    }
}
