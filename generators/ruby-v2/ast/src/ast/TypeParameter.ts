import { AbstractWriter } from "@fern-api/browser-compatible-base-generator";

import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";

export declare namespace TypeParameter {
    export interface Args {
        /* The name of the type parameter */
        name: string;
    }
}

/* A Ruby generic type parameter */
export class TypeParameter extends AstNode {
    public readonly name: string;

    public constructor({ name }: TypeParameter.Args) {
        super();
        this.name = name;
    }

    public write(writer: Writer): void {
        // This is a no-op here, since type parameters are never printed in actual code, only in type definitions
        return;
    }

    public writeTypeDefinition(writer: Writer): void {
        writer.write(this.name);
    }
}
