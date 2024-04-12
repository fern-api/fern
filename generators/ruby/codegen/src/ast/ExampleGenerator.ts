import { ExampleEndpointCall } from "@fern-fern/ir-sdk/api";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";
import { Expression } from "./expressions/Expression";
import { Function_ } from "./functions/Function_";

export declare namespace ExampleGenerator {
    export interface Init extends AstNode.Init {
        rootClientClass: Class_;
        gemName: string;
        apiName: string;
    }
}
export class ExampleGenerator {
    private rootClientClass: Class_;
    private gemName: string;
    private apiName: string;

    constructor({ rootClientClass, gemName, apiName }: ExampleGenerator.Init) {
        this.rootClientClass = rootClientClass;
        this.gemName = gemName;
        this.apiName = apiName;
    }

    public generateImport(): string {
        return `require "${this.gemName}"`;
    }

    public generateClientSnippet(): Expression {
        return new Expression({
            rightSide: this.rootClientClass.generateSnippet(),
            leftSide: this.apiName,
            isAssignment: true
        });
    }

    public generateEndpointSnippet(
        func: Function_,
        exampleOverride?: ExampleEndpointCall
    ): string | AstNode | undefined {
        return func.generateSnippet(this.apiName, exampleOverride);
    }
}
