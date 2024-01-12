import { Argument } from "./Argument";
import { AstNode } from "./AstNode";
import { ClassReference } from "./ClassReference";
import { Expression } from "./Expression";
import { Function_ } from "./Function_";
import { Variable } from "./Variable";

interface BlockConfiguration {
    arguments?: string;
    expressions: Expression[];
}
export declare namespace FunctionInvocation {
    export interface Init extends AstNode.Init {
        baseFunction: Function_;
        onObject?: ClassReference | string | Variable;
        arguments_?: Argument[];
        block?: BlockConfiguration;
    }
}
export class FunctionInvocation extends AstNode {
    public baseFunction: Function_;
    // Required if this function is a class method
    public onObject: ClassReference | Variable | string | undefined;
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

    private writeBlock(startingTabSpaces: number): string {
        return this.block
            ? `
 do ${this.block.arguments !== undefined && "|" + this.block.arguments + "|"}
${this.block.expressions.map((exp) => exp.writeInternal(startingTabSpaces))}
end
`
            : "";
    }

    private writeArgmuments(): string {
        return this.arguments_.map((a) => a.writeInternal(0)).join(", ");
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): string {
        const className = this.onObject instanceof AstNode ? this.onObject.name : this.onObject;
        // Note there's no real documentation here, but it'll be
        return this.writePaddedString(
            startingTabSpaces,
            `
${className !== undefined && className + "."}${this.baseFunction.name}(${this.writeArgmuments()})${this.writeBlock(
                startingTabSpaces
            )}
`
        );
    }
}
