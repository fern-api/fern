import { ClassReferenceFactory } from "./classes/ClassReference";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";
import { Expression } from "./expressions/Expression";
import { Function_ } from "./functions/Function_";

export declare namespace ExampleGenerator {
    export interface Init extends AstNode.Init {
        rootClientClass: Class_;
        crf: ClassReferenceFactory;
        gemName: string;
        apiName: string;
    }
}
export class ExampleGenerator {
    private rootClientClass: Class_;
    private crf: ClassReferenceFactory;

    private gemName: string;
    private apiName: string;

    constructor({ rootClientClass, gemName, apiName, crf }: ExampleGenerator.Init) {
        this.rootClientClass = rootClientClass;
        this.crf = crf;
        this.gemName = gemName;
        this.apiName = apiName;
    }

    public generateImport(): string {
        return `require "${this.gemName}"`;
    }

    public generateClientSnippet(): Expression {
        return new Expression({
            rightSide: this.rootClientClass.generateSnippet(this.crf),
            leftSide: this.apiName,
            isAssignment: true
        });
    }

    public generateEndpointSnippet(func: Function_): string | AstNode | undefined {
        return func.generateSnippet(this.apiName, this.crf);
    }
}
