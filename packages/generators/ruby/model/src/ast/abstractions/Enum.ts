import { Argument } from "../Argument";
import { ClassReference, GenericClassReference, HashInstance, HashReference } from "../classes/ClassReference";
import { AstNode } from "../core/AstNode";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";
import { Variable } from "../Variable";

export declare namespace Enum {
    export interface ReferenceInit extends AstNode.Init {
        name: string;
    }
    export interface InstanceInit extends AstNode.Init {
        contents: Map<string, string>;
    }
}

// TODO: allow for per-enum documentation
export class Enum extends HashInstance {
    constructor({ contents, documentation }: Enum.InstanceInit) {
        super({ contents, isFrozen: true, documentation });
    }
}

export class EnumReference extends HashReference {
    constructor({ name }: Enum.ReferenceInit) {
        super({ name, keyType: "String", valueType: "String" });
    }

    public toJson(variable: Variable | string): FunctionInvocation | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "fetch", functionBody: [] }),
            onObject: variable
        });
    }

    public fromJson(variable: Variable | string): FunctionInvocation | undefined {
        return new FunctionInvocation({
            baseFunction: new Function_({ name: "key", functionBody: [] }),
            onObject: new ClassReference({ name: "Set", import_: new Import({ from: "set", isExternal: true }) }),
            arguments_: [new Argument({ value: variable, isNamed: false, type: GenericClassReference })]
        });
    }
}
