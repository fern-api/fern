import { GoTypeReference } from "./GoTypeReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { MethodInvocation } from "./MethodInvocation";

export declare namespace EnumInstantiation {
    interface Args {
        /* The member of the enum to instantiate */
        typeReference: GoTypeReference;
        /* Whether to instantiate the enum as a pointer */
        pointer?: boolean;
    }
}

export class EnumInstantiation extends AstNode {
    public readonly typeReference: GoTypeReference;
    public readonly pointer: boolean;

    constructor({ typeReference, pointer }: EnumInstantiation.Args) {
        super();
        this.typeReference = typeReference;
        this.pointer = pointer ?? false;
    }

    public write(writer: Writer): void {
        if (this.pointer) {
            writer.writeNode(
                new MethodInvocation({
                    on: this.typeReference,
                    method: "Ptr",
                    arguments_: []
                })
            );
            return;
        }
        writer.writeNode(this.typeReference);
    }
}
