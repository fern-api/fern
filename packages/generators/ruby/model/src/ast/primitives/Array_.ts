import { AstNode } from "../AstNode";
import { ClassReference } from "../ClassReference";

export declare namespace Array_ {
    export interface Init extends AstNode.Init {
        contents?: string[];
        type: ClassReference | string;
    }
}
export class Array_ extends ClassReference {
    public contents: string[];
    constructor({ contents = [], type, ...rest }: Array_.Init) {
        const typeName = type instanceof ClassReference ? type.name : type;
        super({ name: `Array<${typeName}>`, ...rest });

        this.contents = contents;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `[${this.contents.join(", ")}]`;
    }
}
