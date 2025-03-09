import { NamedArgument } from "@fern-api/browser-compatible-base-generator";

import { ClassReference } from "./ClassReference";
import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { writeArguments, writeBuilderArguments } from "./utils/writeArguments";

export declare namespace BuilderInstantiation {
    interface Args {
        /* The class to instantiate */
        classReference: ClassReference;
        /* The arguments passed to the builder */
        arguments_: NamedArgument[];
    }
}

export class BuilderInstantiation extends AstNode {
    private classReference: ClassReference;
    private arguments_: NamedArgument[];

    constructor({ classReference, arguments_ }: BuilderInstantiation.Args) {
        super();

        this.classReference = classReference;
        this.arguments_ = arguments_;
    }

    public write(writer: Writer): void {
        writer.writeNode(this.classReference);
        writeBuilderArguments({ writer, arguments_: this.arguments_ });
    }
}
