import { type Generation } from "../../context/generation-info";
import { Writer } from "../core/Writer";
import { DefinedType } from "./DefinedType";

export declare namespace Interface {
    interface Args extends DefinedType.Args {}
}

export class Interface extends DefinedType {
    constructor(
        { name, namespace, access, partial, interfaceReferences, enclosingType, origin }: Interface.Args,
        generation: Generation
    ) {
        super({ name, namespace, access, partial, interfaceReferences, enclosingType, origin }, generation);
    }

    public write(writer: Writer): void {
        if (!this.isNested) {
            writer.writeLine(`namespace ${this.namespace};`);
            writer.newLine();
        }
        writer.write(`${this.access} `);
        if (this.partial) {
            writer.write("partial ");
        }
        writer.write("interface ");
        writer.writeLine(`${this.name}`);

        if (this.interfaceReferences.length > 0) {
            writer.write(" : ");
            this.interfaceReferences.forEach((interfaceReference, index) => {
                interfaceReference.write(writer);
                // Don't write a comma after the last interface
                if (index < this.interfaceReferences.length - 1) {
                    writer.write(", ");
                }
            });
        }
        writer.pushScope();
        for (const field of this.fields) {
            field.write(writer);
            writer.writeLine("");
        }
        writer.dedent();

        writer.indent();
        for (const method of this.methods) {
            method.write(writer);
            writer.writeLine("");
        }
        writer.popScope();
    }
}
