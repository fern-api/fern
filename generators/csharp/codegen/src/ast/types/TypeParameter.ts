import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
export declare namespace TypeParameter {
    export interface Args {
        /* The name of the type parameter */
        name: string;
    }
}

/* A C# generic type parameter */
export class TypeParameter extends AstNode {
    name: string;
    public constructor({ name }: TypeParameter.Args, generation: Generation) {
        super(generation);
        this.name = name;
    }

    public write(writer: Writer): void {
        writer.write(this.name);
    }

    public get isAsyncEnumerable(): boolean {
        return this.name === "IAsyncEnumerable";
    }

    public get isOptional(): boolean {
        return false;
    }
}
