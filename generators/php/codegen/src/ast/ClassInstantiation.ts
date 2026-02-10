import { Arguments } from "@fern-api/browser-compatible-base-generator";

import { ClassReference } from "./ClassReference.js";
import { AstNode } from "./core/AstNode.js";
import { Writer } from "./core/Writer.js";
import { writeArguments } from "./utils/writeArguments.js";

export declare namespace ClassInstantiation {
    interface Args {
        /* The class reference to instantiate */
        classReference: ClassReference;
        /* The arguments passed into the class constructor */
        arguments_: Arguments;
        /* Write the instantiation across multiple lines */
        multiline?: boolean;
    }
}

export class ClassInstantiation extends AstNode {
    public readonly classReference: ClassReference;
    public readonly arguments_: Arguments;
    private multiline: boolean;

    constructor({ classReference, arguments_, multiline }: ClassInstantiation.Args) {
        super();
        this.classReference = classReference;
        this.arguments_ = arguments_;
        this.multiline = multiline ?? false;
    }

    public write(writer: Writer): void {
        writer.write("new ");
        writer.writeNode(this.classReference);
        writeArguments({ writer, arguments_: this.arguments_, multiline: this.multiline });
    }
}
