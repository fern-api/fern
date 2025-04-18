import { BLOCK_END } from "../../utils/RubyConstants";
import { Import } from "../Import";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";

export declare namespace CaseStatement {
    export interface Init extends AstNode.Init {
        case_: string | AstNode;
        whenBlocks: Map<string, (Expression | FunctionInvocation)[]>;
        else_?: (Expression | FunctionInvocation)[];
    }
}
export class CaseStatement extends AstNode {
    public case_: string | AstNode;
    public whenBlocks: Map<string, (Expression | FunctionInvocation)[]>;
    public else_: (Expression | FunctionInvocation)[] | undefined;

    constructor({ case_, whenBlocks, else_, ...rest }: CaseStatement.Init) {
        super(rest);
        this.case_ = case_;
        this.whenBlocks = whenBlocks;
        this.else_ = else_;
    }

    private writeWhenBlock(
        startingTabSpaces: number,
        expressions: (Expression | FunctionInvocation)[],
        when_?: string
    ): void {
        this.addText({
            stringContent: when_ ?? "else",
            templateString: when_ !== undefined ? "when %s" : undefined,
            startingTabSpaces
        });
        expressions.forEach((exp) =>
            this.addText({ stringContent: exp.write({}), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
        );
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({
            stringContent: this.case_ instanceof AstNode ? this.case_.write({}) : this.case_,
            templateString: "case %s",
            startingTabSpaces
        });
        this.whenBlocks.forEach((block, when_) => this.writeWhenBlock(startingTabSpaces, block, when_));
        if (this.else_ !== undefined) {
            this.writeWhenBlock(startingTabSpaces, this.else_);
        }
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        Array.from(this.whenBlocks.values())
            .flat()
            .map((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
