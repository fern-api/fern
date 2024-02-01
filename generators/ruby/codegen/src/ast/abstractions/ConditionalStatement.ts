import { BLOCK_END } from "../../utils/RubyConstants";
import { AstNode } from "../core/AstNode";
import { Import } from "../Import";

export interface Condition {
    rightSide: string | AstNode;
    leftSide?: string | AstNode;
    operation?: string;
    expressions: AstNode[];
}
export declare namespace ConditionalStatement {
    export interface Init extends AstNode.Init {
        if_: Condition;
        elseIf?: Condition[];
        else_?: Condition;
    }
}
export class ConditionalStatement extends AstNode {
    if_: Condition;
    elseIf: Condition[] | undefined;
    else_: Condition | undefined;

    constructor({ if_, elseIf, else_, ...rest }: ConditionalStatement.Init) {
        super(rest);
        this.if_ = if_;
        this.elseIf = elseIf;
        this.else_ = else_;
    }

    private writeCondition(startingTabSpaces: number, condition: Condition, type: "if" | "elsif" | "else"): void {
        if (condition.operation === "!" && condition.leftSide === undefined) {
            this.addText({
                stringContent: "unless ",
                startingTabSpaces
            });
        } else {
            this.addText({
                stringContent: condition.leftSide instanceof AstNode ? condition.leftSide.write() : condition.leftSide,
                templateString: `${type} %s`,
                startingTabSpaces
            });
        }
        this.addText({
            stringContent: condition.rightSide instanceof AstNode ? condition.rightSide.write() : condition.rightSide,
            appendToLastString: true
        });
        condition.expressions.forEach((exp) =>
            this.addText({ stringContent: exp.write(), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
        );
    }

    public writeInternal(startingTabSpaces: number): void {
        this.writeCondition(startingTabSpaces, this.if_, "if");
        if (this.elseIf !== undefined) {
            this.elseIf.forEach((condition) => this.writeCondition(startingTabSpaces, condition, "elsif"));
        }
        if (this.else_ !== undefined) {
            this.writeCondition(startingTabSpaces, this.if_, "else");
        }
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        [
            ...this.if_.expressions,
            ...Array.from(this.elseIf?.values() ?? []).flatMap((condition) => condition.expressions),
            ...(this.else_?.expressions ?? [])
        ].forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
