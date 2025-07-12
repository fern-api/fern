import { Arguments } from "@fern-api/browser-compatible-base-generator";

import { StructReference } from "./StructReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { writeArguments } from "./utils/writeArguments";

export declare namespace StructInstantiation {
    interface Args {
        /* The class reference to instantiate */
        structReference: StructReference;
        /* The arguments passed into the class constructor */
        arguments_: Arguments;
        /* Write the instantiation across multiple lines */
        multiline?: boolean;
    }
}

export class StructInstantiation extends AstNode {
    public readonly structReference: StructReference;
    public readonly arguments_: Arguments;
    private multiline: boolean;

    constructor({ structReference, arguments_, multiline }: StructInstantiation.Args) {
        super();
        this.structReference = structReference;
        this.arguments_ = arguments_;
        this.multiline = multiline ?? false;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.structReference);
        writer.write("::new");
        writeArguments({ writer, arguments_: this.arguments_, multiline: this.multiline });
    }
}
