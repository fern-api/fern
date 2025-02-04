import { Parameter } from "./Parameter";
import { AstNode } from "./core/AstNode";

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
