import { AstNode } from "../AstNode";
import { ClassReference } from "../classes/ClassReference";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Variable } from "../Variable";

export declare namespace Hash_ {
    export interface InitReference extends AstNode.Init {
        keyType: ClassReference | string;
        valueType: ClassReference | string;
    }
    export interface InitInstance extends AstNode.Init {
        contents?: Map<string, string | FunctionInvocation | Variable>;
        isFrozen?: boolean;
    }
}
export class HashReference extends ClassReference {
    constructor({ keyType, valueType, ...rest }: Hash_.InitReference) {
        const keyTypeName = keyType instanceof ClassReference ? keyType.name : keyType;
        const valueTypeName = valueType instanceof ClassReference ? valueType.name : valueType;
        super({ name: `Hash{${keyTypeName} => ${valueTypeName}}`, ...rest });
    }
}

export class HashInstance extends AstNode {
    public contents: Map<string, string | FunctionInvocation | Variable>;
    public isFrozen: boolean;

    constructor({ contents = new Map(), isFrozen = false, ...rest }: Hash_.InitInstance) {
        super(rest);

        this.contents = contents;
        this.isFrozen = isFrozen;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `${JSON.stringify(Object.fromEntries(this.contents.entries()))}${this.isFrozen && ".frozen"}`;
    }
}
