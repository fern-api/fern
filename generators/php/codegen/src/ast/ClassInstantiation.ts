import { Arguments } from "@fern-api/base-generator";

import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { writeArguments } from "./utils/writeArguments";

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
