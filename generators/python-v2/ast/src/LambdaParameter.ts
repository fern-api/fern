import { AstNode } from "./core/AstNode";
import { Parameter } from "./Parameter";

export declare namespace LambdaParameter {
    interface Args {
        /* The name of the parameter */
        name: string;
        /* The initializer for the parameter */
        initializer?: AstNode;
    }
}

export class LambdaParameter extends Parameter {
    constructor({ name, initializer }: LambdaParameter.Args) {
        super({ name, initializer, type: undefined });
    }
}
