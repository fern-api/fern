import { AstNode } from "./core/AstNode";

export declare namespace Argument {
    export interface Named extends AstNode.Init {
        name: string;
        value: AstNode | string;
        shouldExpandValue?: boolean;
        readonly isNamed: true;
    }
    export interface Unnamed extends AstNode.Init {
        value: AstNode | string;
        shouldExpandValue?: boolean;
        readonly isNamed: false;
    }
}

export class Argument extends AstNode {
    public name: string | undefined;
    public value: AstNode | string;
    public shouldExpandValue: boolean;

    constructor({ value, shouldExpandValue, ...rest }: Argument.Named | Argument.Unnamed) {
        super(rest);
        this.name = "name" in rest ? rest.name : undefined;
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
