import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { FunctionInvocation } from "./functions/FunctionInvocation";
import { Variable } from "./Variable";

export declare namespace Argument {
    export interface Named extends AstNode.Init {
        name: string;
        type: ClassReference;
        value: Variable | string;
        readonly isNamed: true;
    }
    export interface Unnamed extends AstNode.Init {
        type: ClassReference;
        value: Variable | string;
        readonly isNamed: false;
    }
}

export class Argument extends AstNode {
    public name: string | undefined;
    public type: ClassReference;
    public value: Variable | string;

    constructor({ type, value, ...rest }: Argument.Named | Argument.Unnamed) {
        super(rest);
        this.name = "name" in rest ? rest.name : undefined;
        this.type = type;
        this.value = value;
    }

    public writeInternal(): void {
        this.addText({ stringContent: this.name, templateString: "%s: " });
        this.addText({
            stringContent: this.value instanceof AstNode ? this.value.write() : this.value,
            appendToLastString: true
        });
    }

    public fromJson(): FunctionInvocation | undefined {
        return;
    }
}
