import { BLOCK_END } from "../../utils/RubyConstants";
import { Import } from "../Import";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";

export interface Condition {
    rightSide?: string | AstNode;
    leftSide?: string | AstNode;
    negated?: boolean;
    operation?: string;
    expressions: (AstNode | string)[];
}
export declare namespace ConditionalStatement {
    export interface Init extends AstNode.Init {
        if_: Condition;
        elseIf?: Condition[];
        else_?: AstNode[];
    }
}
export class ConditionalStatement extends AstNode {
    if_: Condition;
    elseIf: Condition[] | undefined;
    else_: AstNode[] | undefined;

    constructor({ if_, elseIf, else_, ...rest }: ConditionalStatement.Init) {
        super(rest);
        this.if_ = if_;
        this.elseIf = elseIf;
        this.else_ = else_;
    }

    private writeCondition(startingTabSpaces: number, condition: Condition, type: "if" | "elsif" | "else"): void {
        const updatedType =
            condition.negated === true ||
            (condition.operation === "!" && (condition.leftSide === undefined || condition.rightSide === undefined))
                ? "unless"
                : type;
        const leftString = condition.leftSide instanceof AstNode ? condition.leftSide.write({}) : condition.leftSide;
        const rightString =
            condition.rightSide instanceof AstNode ? condition.rightSide.write({}) : condition.rightSide;
        this.addText({
            stringContent: leftString ?? rightString,
            templateString: `${updatedType} %s`,
            startingTabSpaces
        });
        if (condition.leftSide !== undefined && condition.rightSide !== undefined && condition.operation !== "!") {
            this.addText({
                templateString: ` ${condition.operation} %s`,
                stringContent: rightString,
                startingTabSpaces,
                appendToLastString: true
            });
        }
        condition.expressions.forEach((exp) =>
            this.addText({
                stringContent: exp instanceof AstNode ? exp.write({}) : exp,
                startingTabSpaces: this.tabSizeSpaces + startingTabSpaces
            })
        );
    }

    private writeElse(startingTabSpaces: number, expressions: AstNode[]): void {
        this.addText({
            stringContent: "else",
            startingTabSpaces
        });
        expressions.forEach((exp) =>
            this.addText({ stringContent: exp.write({}), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
        );
    }

    public writeInternal(startingTabSpaces: number): void {
        this.writeCondition(startingTabSpaces, this.if_, "if");
        if (this.elseIf !== undefined) {
            this.elseIf.forEach((condition) => this.writeCondition(startingTabSpaces, condition, "elsif"));
        }
        if (this.else_ !== undefined) {
            this.writeElse(startingTabSpaces, this.else_);
        }
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        (
            [
                this.if_.leftSide,
                this.if_.rightSide,
                ...this.if_.expressions,
                ...Array.from(this.elseIf?.values() ?? []).flatMap((condition) => [
                    condition.leftSide,
                    condition.rightSide,
                    ...condition.expressions
                ]),
                ...(this.else_ ?? [])
            ].filter((node) => node instanceof AstNode && !(node instanceof Class_)) as AstNode[]
        ).forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
