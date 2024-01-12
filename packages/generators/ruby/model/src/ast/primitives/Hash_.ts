import { AstNode } from "../AstNode";
import { ClassReference } from "../ClassReference";
import { FunctionInvocation } from "../FunctionInvocation";
import { Variable } from "../Variable";

export declare namespace Hash_ {
    export interface Init extends AstNode.Init {
        keyType: ClassReference | string;
        valueType: ClassReference | string;

        contents?: Map<string, string | FunctionInvocation | Variable>;
        isFrozen?: boolean;
    }
}
export class Hash_ extends ClassReference {
    public contents: Map<string, string | FunctionInvocation | Variable>;
    public isFrozen: boolean;

    constructor({ keyType, valueType, contents = new Map(), isFrozen = false, ...rest }: Hash_.Init) {
        const keyTypeName = keyType instanceof ClassReference ? keyType.name : keyType;
        const valueTypeName = valueType instanceof ClassReference ? valueType.name : valueType;
        super({ name: `Hash{${keyTypeName} => ${valueTypeName}}`, ...rest });

        this.contents = contents;
        this.isFrozen = isFrozen;
    }

    public writeInternal(startingTabSpaces: number): string {
        return `${JSON.stringify(Object.fromEntries(this.contents.entries()))}${this.isFrozen && ".frozen"}`;
    }
}
