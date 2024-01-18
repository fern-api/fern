import { AstNode } from "../../AstNode";
import { Class_ } from "../Class_";

export declare namespace Set {
    export interface Init extends AstNode.Init {
        contents?: string[];
        type: Class_ | string;
    }
}
export class Set extends Class_ {
    public contents: string[];
    constructor({ type, contents = [], ...rest }: Set.Init) {
        const typeName = type instanceof Class_ ? type.name : type;
        super({ name: `Set<${typeName}>`, moduleBreadcrumbs: [], ...rest });
    }

    public writeInvokation(): string {
        return `Set[${this.contents.join(", ")}]`;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writeInvokation();
    }
}
