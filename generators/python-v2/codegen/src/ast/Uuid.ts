import { AstNode } from "./core/AstNode";
import { ClassInstantiation } from "./ClassInstantiation";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";
import { MethodArgument } from "./MethodArgument";
import { CodeBlock } from "./CodeBlock";

export declare namespace UUID {
    export interface Args {
        value: string;
    }
}

export class UUID extends AstNode {
    public readonly uuidInstance: ClassInstantiation;

    constructor({ value }: UUID.Args) {
        super();
        this.uuidInstance = this.generateUuidInstance(value);
    }

    public write(writer: Writer): void {
        this.uuidInstance.write(writer);
    }

    private generateUuidInstance(value: string): ClassInstantiation {
        const uuidInstance = new ClassInstantiation({
            classReference: new Reference({
                name: "UUID",
                modulePath: ["uuid"]
            }),
            arguments_: [
                new MethodArgument({
                    value: new CodeBlock(`"${value}"`)
                })
            ]
        });

        this.inheritReferences(uuidInstance);
        return uuidInstance;
    }
}
