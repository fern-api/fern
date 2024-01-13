import { AstNode } from "../AstNode";
import { ClassReference } from "../classes/ClassReference";
import { Import } from "../Import";

export declare namespace Set_ {
    export interface InitReference extends AstNode.Init {
        innerType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: string[];
    }
}
export class SetReference extends ClassReference {
    constructor({ innerType, ...rest }: Set_.InitReference) {
        const typeName = innerType instanceof ClassReference ? innerType.name : innerType;
        super({ name: `Set<${typeName}>`, import_: new Import({ from: "set" }), ...rest });
    }
}

export class SetInstance extends AstNode {
    public contents: string[];
    constructor({ contents = [], ...rest }: Set_.InitInstance) {
        super(rest);
        this.contents = contents;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `Set[${this.contents.join(", ")}]`;
    }
}
