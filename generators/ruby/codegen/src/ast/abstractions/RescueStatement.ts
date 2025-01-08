import { BLOCK_END } from "../../utils/RubyConstants";
import { Import } from "../Import";
import { AstNode } from "../core/AstNode";

export declare namespace RescueStatement {
    export interface Init extends AstNode.Init {
        begin: AstNode[];
        rescue: AstNode[];
    }
}
export class RescueStatement extends AstNode {
    public begin: AstNode[];
    public rescue: AstNode[];

    constructor({ begin, rescue, ...rest }: RescueStatement.Init) {
        super(rest);
        this.begin = begin;
        this.rescue = rescue;
    }

    public writeInternal(startingTabSpaces: number): void {
        this.addText({ stringContent: "begin", startingTabSpaces });
        this.begin.forEach((exp) =>
            this.addText({ stringContent: exp.write({}), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
        );
        this.addText({ stringContent: "rescue StandardError", startingTabSpaces });
        this.rescue.forEach((exp) =>
            this.addText({ stringContent: exp.write({}), startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
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
