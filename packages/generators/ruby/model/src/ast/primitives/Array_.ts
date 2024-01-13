import { AstNode } from "../AstNode";
import { ClassReference } from "../classes/ClassReference";

export declare namespace ArrayReference {
    export interface InitReference extends AstNode.Init {
        innerType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: string[];
    }
}
export class ArrayReference extends ClassReference {
    constructor({ innerType, ...rest }: ArrayReference.InitReference) {
        const typeName = innerType instanceof ClassReference ? innerType.name : innerType;
        super({ name: `Array<${typeName}>`, ...rest });
    }
}

export class ArrayInstance extends AstNode {
    public contents: string[];
    constructor({ contents = [], ...rest }: ArrayReference.InitInstance) {
        super(rest);
        this.contents = contents;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `[${this.contents.join(", ")}]`;
    }
}
