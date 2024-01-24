import { AstNode } from "../core/AstNode";
import { Import } from "../Import";
import { Yardoc } from "../Yardoc";

export declare namespace Expression {
    export interface Init extends AstNode.Init {
        leftSide?: AstNode | string;
        rightSide: AstNode | string;
        isAssignment?: boolean;
        operation?: string;
        yardoc?: Yardoc;
    }
}
export class Expression extends AstNode {
    public leftSide: AstNode | string | undefined;
    public rightSide: AstNode | string;
    public isAssignment: boolean;
    public yardoc: Yardoc | undefined;
    public operation?: string;

    constructor({ leftSide, rightSide, yardoc, operation, isAssignment = false, ...rest }: Expression.Init) {
        super(rest);
        this.leftSide = leftSide;
        this.rightSide = rightSide;
        this.isAssignment = isAssignment && leftSide !== undefined;
        this.operation = isAssignment ? "=" : operation;
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
            templateString:
                this.operation !== undefined ? ` ${this.operation} %s` : leftString === undefined ? undefined : " %s",
            appendToLastString: true,
            startingTabSpaces: leftString === undefined ? startingTabSpaces : undefined
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
