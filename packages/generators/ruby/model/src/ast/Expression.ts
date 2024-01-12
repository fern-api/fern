import { AstNode } from "./AstNode";
import { ClassReference } from "./ClassReference";
import { FunctionInvocation } from "./FunctionInvocation";
import { Variable } from "./Variable";
import { Yardoc } from "./Yardoc";

export declare namespace Expression {
    export interface Init extends AstNode.Init {
        leftSide: Variable | string;
        rightSide: Variable | FunctionInvocation | ClassReference | AstNode | string;
        isAssignment?: boolean;
        yardoc?: Yardoc;
    }
}
export class Expression extends AstNode {
    public leftSide: Variable | string;
    public rightSide: Variable | FunctionInvocation | ClassReference | AstNode | string;
    public isAssignment: boolean;
    public yardoc: Yardoc | undefined;

    constructor({ leftSide, rightSide, yardoc, isAssignment = true, ...rest }: Expression.Init) {
        super(rest);
        this.leftSide = leftSide;
        this.rightSide = rightSide;
        this.isAssignment = isAssignment;
        this.yardoc = yardoc;
    }

    public writeInternal(startingTabSpaces: number): string {
        const leftString =
            this.leftSide instanceof AstNode ? this.leftSide.writeInternal(startingTabSpaces) : this.leftSide;
        const rightString =
            this.rightSide instanceof AstNode ? this.rightSide.writeInternal(startingTabSpaces) : this.rightSide;
        return this.writePaddedString(
            startingTabSpaces,
            `
${this.documentation}
${this.yardoc?.writeInternal(startingTabSpaces)}
${leftString}${this.isAssignment ? " = " : " "}${rightString}
`
        );
    }
}
