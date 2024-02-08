import { Access } from "../core/Access";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { Annotation } from "./Annotation";
import { CodeBlock } from "./CodeBlock";
import { Type } from "./Type";

export declare namespace Field {
    interface Args {
        /* The name of the field */
        name: string;
        /* The type of the field */
        type: Type;
        /* Whether the field has a getter method */
        get?: boolean;
        /* Whether the field has a init method */
        init?: boolean;
        /* The access level of the method */
        access: Access;
        /* Field annotations */
        annotations?: Annotation[];
        /* The initializer for the field */
        initializer?: CodeBlock;
    }
}

export class Field extends AstNode {
    private name: string;
    private type: Type;
    private get: boolean;
    private init: boolean;
    private access: Access;
    private annotations: Annotation[];
    private initializer: CodeBlock | undefined;

    constructor({ name, type, get, init, access, annotations, initializer }: Field.Args) {
        super();
        this.name = name;
        this.type = type;
        this.get = get ?? false;
        this.init = init ?? false;
        this.access = access;
        this.annotations = annotations ?? [];
        this.initializer = initializer;
    }

    public write(writer: Writer): void {
        if (this.annotations.length > 0) {
            writer.write("[");
            for (const annotation of this.annotations) {
                annotation.write(writer);
            }
            writer.writeLine("]");
        }

        writer.write(`${this.access} ${this.type.write(writer)} ${this.name}`);
        if (this.get || this.init) {
            writer.write(" { ");
            if (this.get) {
                writer.write("get; ");
            }
            if (this.init) {
                writer.write("init; ");
            }
            writer.write(" { ");
        }

        if (this.initializer) {
            writer.write(" = ");
            this.initializer.write(writer);
        }

        writer.writeLine(";");
    }
}
