import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";

namespace EnumReference {
    export type Args = {
        enum: Reference;
        member: string;
    };
}

export class EnumReference extends AstNode {
    public readonly enum: Reference;
    public readonly member: string;

    constructor({ enum: enumRef, member }: EnumReference.Args) {
        super();
        this.enum = enumRef;
        this.member = member;
    }

    public write(writer: Writer): void {
        writer.write(`${this.enum.name}.${this.member}`);
    }
}
