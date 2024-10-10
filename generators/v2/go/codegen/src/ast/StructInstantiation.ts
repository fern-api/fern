import { Arguments } from "@fern-api/generator-commons";
import { GoTypeReference } from "./GoTypeReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { writeArguments } from "./utils/writeArguments";
import { Struct } from "../go";

export declare namespace StructInstantiation {
    interface Args {
        /* The struct to instantiate */
        typeReference: GoTypeReference;
        /* The fields passed into the struct instantiation */
        fields: StructInstantiation.Field[];
        /* Whether to instantiate the struct as a pointer */
        pointer?: boolean;
    }

    interface Field {
        name: string;
        value: AstNode;
    }
}

// TODO: What if this was just an 'instantiate' method on the Struct and Enum classes?
//
// We could roll out an "Instantiation" abstract calss that would be implemented
// by both Struct and Enum, and they could expose the arguments they want to set
// for specific fields.
//
// Would Struct need to be generic on the fields we provide so instantiate could be
// strongly typed against the fields we provide? That might be difficult to use.
export class StructInstantiation extends AstNode {
    public readonly typeReference: GoTypeReference;
    public readonly fields: StructInstantiation.Field[];
    public readonly pointer: boolean;

    constructor({ typeReference, fields, pointer }: StructInstantiation.Args) {
        super();
        this.typeReference = typeReference;
        this.fields = fields;
        this.pointer = pointer ?? false;
    }

    public write(writer: Writer): void {
        if (this.pointer) {
            writer.write("&");
        }
        writer.writeNode(this.typeReference);
        if (this.fields.length === 0) {
            writer.write("{}");
            return;
        }
        writer.writeLine("{");
        writer.indent();
        for (const field of this.fields) {
            writer.write(`${field.name}: `);
            field.value.write(writer);
            writer.writeLine(",");
        }
        writer.dedent();
        writer.write("}");
    }
}
