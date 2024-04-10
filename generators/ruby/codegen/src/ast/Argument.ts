import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { FunctionInvocation } from "./functions/FunctionInvocation";
import { Variable } from "./Variable";

export declare namespace Argument {
    export interface Named extends AstNode.Init {
        name: string;
        type: ClassReference | ClassReference[];
        value: FunctionInvocation | Variable | string;
        shouldExpandValue?: boolean;
        readonly isNamed: true;
    }
    export interface Unnamed extends AstNode.Init {
        type: ClassReference | ClassReference[];
        value: FunctionInvocation | Variable | string;
        shouldExpandValue?: boolean;
        readonly isNamed: false;
    }
}

export class Argument extends AstNode {
    public name: string | undefined;
    public type: ClassReference[];
    public value: FunctionInvocation | Variable | string;
    public shouldExpandValue: boolean;

    constructor({ type, value, shouldExpandValue, ...rest }: Argument.Named | Argument.Unnamed) {
        super(rest);
        this.name = "name" in rest ? rest.name : undefined;
        this.type = type instanceof ClassReference ? [type] : type;
        this.value = value;
        this.shouldExpandValue = shouldExpandValue ?? false;
    }

    public writeInternal(): void {
        this.addText({ stringContent: this.name, templateString: "%s: " });
        this.addText({
            stringContent: this.value instanceof AstNode ? this.value.write({}) : this.value,
            templateString: this.shouldExpandValue ? "*%s" : undefined,
            appendToLastString: true
        });
    }

    public fromJson(): AstNode | undefined {
        return;
    }
}
