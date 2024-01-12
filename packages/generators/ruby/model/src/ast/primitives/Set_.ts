import { AstNode } from "../AstNode";
import { ClassReference } from "../ClassReference";

export declare namespace Set_ {
    export interface Init extends AstNode.Init {
        contents?: string[];
        type: ClassReference | string;
    }
}
export class Set_ extends ClassReference {
    public contents: string[];
    constructor({ type, contents = [], ...rest }: Set_.Init) {
        const typeName = type instanceof ClassReference ? type.name : type;
        super({ name: `Set<${typeName}>`, ...rest });

        this.contents = contents;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `Set[${this.contents.join(", ")}]`;
    }
}
