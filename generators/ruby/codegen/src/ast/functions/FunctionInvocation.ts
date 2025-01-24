import { BLOCK_END } from "../../utils/RubyConstants";
import { Argument } from "../Argument";
import { Import } from "../Import";
import { Variable } from "../Variable";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";
import { Function_ } from "./Function_";

export interface BlockConfiguration {
    arguments?: string;
    expressions: AstNode[];
}
export declare namespace FunctionInvocation {
    export interface Init extends AstNode.Init {
        baseFunction?: Function_;
        onObject?: Variable | AstNode | string;
        arguments_?: Argument[];
        block?: BlockConfiguration;
        optionalSafeCall?: boolean;
        useFullPath?: boolean;
    }
}
export class FunctionInvocation extends AstNode {
    public baseFunction: Function_ | undefined;
    // Required if this function is a class method
    public onObject: Variable | AstNode | string | undefined;
    public arguments_: Argument[];
    // A block is usually the do ... end block you see right
    // after a traditional function invocation.
    public block: BlockConfiguration | undefined;
    public optionalSafeCall: boolean;
    public useFullPath: boolean;

    constructor({
        baseFunction,
        onObject,
        arguments_ = [],
        block,
        optionalSafeCall,
        useFullPath = true,
        ...rest
    }: FunctionInvocation.Init) {
        super(rest);
        this.baseFunction = baseFunction;
        this.onObject = onObject;
        this.arguments_ = arguments_;
        this.block = block;
        this.optionalSafeCall =
            optionalSafeCall ?? (this.onObject instanceof Variable ? this.onObject.isOptional : false);

        this.useFullPath = useFullPath;
    }

    private writeBlock(startingTabSpaces: number) {
        if (this.block && this.block.expressions.length > 0) {
            this.addText({ stringContent: " do", appendToLastString: true, startingTabSpaces });
            this.addText({
                stringContent: this.block.arguments,
                templateString: " | %s |",
                appendToLastString: true,
                startingTabSpaces
            });
            this.block.expressions.forEach((exp) =>
                this.addText({
                    stringContent: exp.write({ startingTabSpaces: this.tabSizeSpaces + startingTabSpaces })
                })
            );
            this.addText({ stringContent: BLOCK_END, startingTabSpaces });
        }
    }

    private writeArgmuments(startingTabSpaces: number) {
        if (this.arguments_.length > 2) {
            this.addText({ stringContent: "(", appendToLastString: true });
            this.arguments_.forEach((arg, idx) =>
                this.addText({
                    stringContent: arg.write({}),
                    appendToLastString: false,
                    templateString: idx < this.arguments_.length - 1 ? "%s," : undefined,
                    startingTabSpaces: this.tabSizeSpaces + startingTabSpaces
                })
            );
            this.addText({ stringContent: ")", appendToLastString: false, startingTabSpaces });
        } else if (this.arguments_.length > 0) {
            this.addText({ stringContent: "(", appendToLastString: true });
            this.arguments_.forEach((arg, idx) =>
                this.addText({
                    stringContent: arg.write({}),
                    appendToLastString: true,
                    templateString: idx === 0 ? undefined : ", %s",
                    startingTabSpaces
                })
            );
            this.addText({ stringContent: ")", appendToLastString: true, startingTabSpaces });
        }
    }

    // When writing the definition
    public writeInternal(startingTabSpaces: number): void {
        const onObject = this.onObject instanceof AstNode ? this.onObject.write({}) : this.onObject;
        this.addText({
            stringContent: onObject,
            startingTabSpaces
        });
        this.addText({
            stringContent: this.baseFunction?.getInvocationName(this.useFullPath),
            templateString: onObject === undefined ? undefined : this.optionalSafeCall ? "&.%s" : ".%s",
            startingTabSpaces,
            appendToLastString: true
        });
        this.writeArgmuments(startingTabSpaces);
        this.writeBlock(startingTabSpaces);
    }

    public getImports(): Set<Import> {
        let imports = new Set<Import>();
        if (this.onObject instanceof AstNode) {
            imports = new Set([...imports, ...this.onObject.getImports()]);
        }

        this.arguments_.forEach((arg) => (imports = new Set([...imports, ...arg.getImports()])));
        this.block?.expressions
            .filter((exp) => !(exp instanceof Class_))
            .forEach((exp) => (imports = new Set([...imports, ...exp.getImports()])));
        return imports;
    }
}
