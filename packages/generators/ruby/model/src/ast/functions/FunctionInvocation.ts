import { BLOCK_END } from "../../utils/Constants";
import { Argument } from "../Argument";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";
import { Variable } from "../Variable";

interface BlockConfiguration {
    arguments?: string;
    expressions: Expression[];
}
export declare namespace FunctionInvocation {
    export interface Init extends AstNode.Init {
        baseFunction: Function_;
        onObject?: Variable | AstNode | string;
        arguments_?: Argument[];
        block?: BlockConfiguration;
    }
}
export class FunctionInvocation extends AstNode {
    public baseFunction: Function_;
    // Required if this function is a class method
    public onObject: Variable | AstNode | string | undefined;
    public arguments_: Argument[];
    // A block is usually the do ... end block you see right
    // after a traditional function invocation.
    public block: BlockConfiguration | undefined;

    constructor({ baseFunction, onObject, arguments_ = [], block, ...rest }: FunctionInvocation.Init) {
        super(rest);
        this.baseFunction = baseFunction;
        this.onObject = onObject;
        this.arguments_ = arguments_;
        this.block = block;
    }

    private writeBlock(startingTabSpaces: number) {
        if (this.block) {
            this.addText({stringContent: " do", appendToLastString: true, startingTabSpaces});
            this.addText({stringContent: this.block.arguments, templateString: " | %s |", appendToLastString: true, startingTabSpaces});
            this.block.expressions.forEach((exp) => this.addText({stringContent: exp.write(this.tabSizeSpaces + startingTabSpaces)}));
            this.addText({stringContent: BLOCK_END, startingTabSpaces});
        }
//         return this.block
//             ? `
// do ${this.block.arguments !== undefined && "|" + this.block.arguments + "|"}
// ${this.block.expressions.map((exp) => exp.write(startingTabSpaces))}
// end
// `
//             : undefined;
    }

    private writeArgmuments(): string {
        return `(${this.arguments_.map((a) => a.write()).join(", ")})`;
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): void {
        const isOptional = this.onObject instanceof Variable ? this.onObject.isOptional : false;
        const className = this.onObject instanceof AstNode ? this.onObject.write() : this.onObject;
        this.addText({ stringContent: className, templateString: isOptional ? "%s&." : "%s.", startingTabSpaces });
        this.addText({ stringContent: this.baseFunction.name, startingTabSpaces, appendToLastString: true });
        this.addText({ stringContent: this.writeArgmuments(), appendToLastString: true });
        this.writeBlock(startingTabSpaces);
        // this.addText({ stringContent: this.writeBlock(startingTabSpaces), appendToLastString: true });
    }

    public getImports(): Set<Import> {
        let imports = this.baseFunction.getImports();
        if (this.onObject instanceof AstNode) {
            imports = new Set([...imports, ...this.onObject.getImports()]);
        }
        this.arguments_.forEach((arg) => (imports = new Set([...imports, ...arg.getImports()])));
        this.block?.expressions.forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
