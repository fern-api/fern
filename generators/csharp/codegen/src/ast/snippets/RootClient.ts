import { Class } from "../Class";
import { ClassInstantiation } from "../ClassInstantiation";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

export declare namespace RootClient {
    interface Args {
        /* The name of the client */
        name: string;
        // TODO(abelardo): this should really live within this file as well, and this class
        // should be used for more than just snippets in the future.
        /* The class of the client */
        class_: Class;
        /* The example to instantiate the client with */
        example: Map<string, unknown>;
    }
}

export class RootClient extends AstNode {
    public readonly name: string;
    private classInstantiation: ClassInstantiation;

    constructor({ name, class_, example }: RootClient.Args) {
        super();
        this.name = name;
        this.classInstantiation = class_.getInitializerFromExample(example);
    }

    public write(writer: Writer): void {
        throw new Error("Method not implemented.");
    }
}
