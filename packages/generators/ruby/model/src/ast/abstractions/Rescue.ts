import { BLOCK_END } from "../../utils/Constants";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { Import } from "../Import";

export declare namespace CaseStatement {
    export interface Init extends AstNode.Init {
        begin: Expression[];
        rescue: Expression[];
    }
}
export class CaseStatement extends AstNode {
    public begin: Expression[];
    public rescue: Expression[];

    constructor({ begin, rescue, ...rest }: CaseStatement.Init) {
        super(rest);
        this.begin = begin;
        this.rescue = rescue;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({stringContent: "begin", startingTabSpaces});
        this.begin.forEach((exp) =>
            this.addText({ stringContent: exp.write(), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
        );
        this.addText({stringContent: "resuce StandardError", startingTabSpaces});
        this.rescue.forEach((exp) =>
            this.addText({ stringContent: exp.write(), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
        );
        this.addText({ stringContent: BLOCK_END, startingTabSpaces });
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        Array.from(this.begin.concat(this.rescue).values())
            .flat()
            .map((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
