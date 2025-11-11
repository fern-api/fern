import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";

export declare namespace CoreClassReference {
    interface Args {
        /* The name of the C# class */
        name: string;
    }
}

export class CoreClassReference extends AstNode {
    public readonly name: string;

    constructor({ name }: CoreClassReference.Args, generation: Generation) {
        super(generation);
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.write(`${this.name}`);
    }
}
