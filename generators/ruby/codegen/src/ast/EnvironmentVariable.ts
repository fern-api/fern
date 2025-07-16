import { AstNode } from "./core/AstNode";

export declare namespace EnvironmentVariable {
    export interface Init {
        variableName: string;
    }
}
export class EnvironmentVariable extends AstNode {
    public variableName: string;

    constructor({ variableName }: EnvironmentVariable.Init) {
        super({});
        this.variableName = variableName;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: this.variableName,
            templateString: 'ENV["%s"]',
            startingTabSpaces
        });
    }
}
