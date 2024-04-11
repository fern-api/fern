import { ClassReference } from "./classes/ClassReference";
import { AstNode } from "./core/AstNode";
import { Expression } from "./expressions/Expression";
import { Function_ } from "./functions/Function_";

export declare namespace ExampleGenerator {
    export interface Init extends AstNode.Init {
        rootClientClassReference: ClassReference;
        gemName: string;
        apiName: string;
    }
}
export class ExampleGenerator {
    private rootClientClassReference: ClassReference;
    private gemName: string;
    private apiName: string;

    constructor({ rootClientClassReference, gemName, apiName }: ExampleGenerator.Init) {
        this.rootClientClassReference = rootClientClassReference;
        this.gemName = gemName;
        this.apiName = apiName;
    }

    public generateImport(): string {
        return `require "${this.gemName}"`;
    }

    public generateClientSnippet(): Expression {
        return new Expression({
            // TODO: make this take in API key, etc.
            rightSide: this.rootClientClassReference.generateSnippet({}),
            leftSide: this.apiName,
            isAssignment: true
        });
    }

    public generateEndpointSnippet(func: Function_, example: unknown): string | AstNode {
        return func.generateSnippet(this.apiName, example);
    }
}
