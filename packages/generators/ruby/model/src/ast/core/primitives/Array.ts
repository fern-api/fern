import { AstNode } from "../../AstNode";
import { Class_ } from "../Class_";

export declare namespace Array {
    export interface Init extends AstNode.Init {
        contents?: string[];
        type: Class_ | string;
    }
}
export class Array extends Class_ {
    public contents: string[];
    constructor({ contents = [], type, ...rest }: Array.Init) {
        const typeName = type instanceof Class_ ? type.name : type;
        super({ name: `Array<${typeName}>`, moduleBreadcrumbs: [], ...rest });

        this.contents = contents;
    }

    public writeInvokation(): string {
        return `[${this.contents.join(", ")}]`;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writeInvokation();
    }
}
