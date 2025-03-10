import { AstNode } from "./core/AstNode";

export declare namespace Parameter {
    interface Args {
        name: string;
    }
}

export abstract class Parameter extends AstNode {
    public readonly name: string;

    constructor({ name }: Parameter.Args) {
        super();
        this.name = name;
    }
}
