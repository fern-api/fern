import { AstNode } from "../../AstNode";
import { Class_ } from "../Class_";

export declare namespace Hash {
    export interface Init extends AstNode.Init {
        keyType: Class_ | string;
        valueType: Class_ | string;

        contents?: Map<string, string>;
        isFrozen?: boolean;
    }
}
export class Hash extends Class_ {
    public contents: Map<string, string>;
    public isFrozen: boolean;

    constructor({ keyType, valueType, contents = new Map(), isFrozen = false, ...rest }: Hash.Init) {
        const keyTypeName = keyType instanceof Class_ ? keyType.name : keyType;
        const valueTypeName = valueType instanceof Class_ ? valueType.name : valueType;
        super({ name: `Hash{${keyTypeName} => ${valueTypeName}}`, moduleBreadcrumbs: [], ...rest });

        this.contents = contents;
        this.isFrozen = isFrozen;
    }

    public writeInvokation(): string {
        return `${JSON.stringify(Object.fromEntries(this.contents.entries()))}${this.isFrozen && ".frozen"}`;
    }

    public writeInternal(startingTabSpaces: number): string {
        return this.writeInvokation();
    }
}
