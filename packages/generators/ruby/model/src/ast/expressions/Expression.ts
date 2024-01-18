import { ClassReference } from "../classes/ClassReference";
import { AstNode } from "../core/AstNode";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Import } from "../Import";
import { Variable } from "../Variable";
import { Yardoc } from "../Yardoc";

export declare namespace Expression {
    export interface Init extends AstNode.Init {
        leftSide?: Variable | string;
        rightSide: Variable | FunctionInvocation | ClassReference | AstNode | string;
        isAssignment?: boolean;
        yardoc?: Yardoc;
    }
}
export class Expression extends AstNode {
    public leftSide: Variable | string | undefined;
    public rightSide: Variable | FunctionInvocation | ClassReference | AstNode | string ;
    public isAssignment: boolean;
    public yardoc: Yardoc | undefined;

    constructor({ leftSide, rightSide, yardoc, isAssignment = true, ...rest }: Expression.Init) {
        super(rest);
        this.leftSide = leftSide;
        this.rightSide = rightSide;
        this.isAssignment = isAssignment && leftSide !== undefined;
        this.yardoc = yardoc;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: this.yardoc?.write(startingTabSpaces) });
        const leftString = this.leftSide instanceof AstNode ? this.leftSide.write() : this.leftSide;
        const rightString = this.rightSide instanceof AstNode ? this.rightSide.write() : this.rightSide;
        if (this.leftSide !== undefined) {
            this.addText({ stringContent: leftString, startingTabSpaces });
        }
        this.addText({
            stringContent: rightString,
            templateString: this.isAssignment ? " = %s" : " %s",
            appendToLastString: true
        });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        if (this.rightSide instanceof AstNode) {
            imports = new Set([...imports, ...this.rightSide.getImports()]);
        }
        return imports;
    }
}
