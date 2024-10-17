import { AstNode } from "./AstNode";
import { Writer } from "./Writer";
import { Interface } from "./Interface";

export declare namespace Namespace {
    interface Args {
        /* Whether to export */
        export?: boolean;
        /* Namespace of the name */
        name?: string;
    }
}

export class Namespace extends AstNode {
    /**
     * The ordered elements inside of a namespace
     */
    private elements: (Interface | Namespace)[] = [];

    public constructor(private readonly args: Namespace.Args) {
        super();
    }

    public addNamespace(interface_: Namespace): void {
        this.elements.push(interface_);
    }

    public addInterface(interface_: Interface): void {
        this.elements.push(interface_);
    }

    public write(writer: Writer): void {
        if (this.args.export) {
            writer.write("export ");
        }

        let setAmbience = false;
        if (!writer.isAmbient) {
            writer.write("declare ");
            writer.setAmbient(true);
            setAmbience = true;
        }

        writer.writeLine(`namespace ${this.args.name} {`);

        writer.indent();
        for (const element of this.elements) {
            writer.writeNode(element);
            writer.writeLine();
            writer.writeLine();
        }
        writer.dedent();

        writer.writeLine(`}`);

        if (setAmbience) {
            writer.setAmbient(false);
        }
    }
}
