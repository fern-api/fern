import { AstNode, Writer } from "./core";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Interface } from "./Interface";
import { Namespace } from "./Namespace";

export declare namespace TypescriptFile {}

export class TypescriptFile extends AstNode {
    /**
     * The ordered elements inside of a namespace
     */
    private elements: (Interface | Namespace)[] = [];

    public addNamespace(interface_: Namespace): void {
        this.elements.push(interface_);
    }

    public addInterface(interface_: Interface): void {
        this.elements.push(interface_);
    }

    public write(writer: Writer): void {
        for (const element of this.elements) {
            writer.writeNode(element);
            writer.writeLine();
            writer.writeLine();
            writer.writeLine();
        }
    }
}
