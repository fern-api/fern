import { CodeBlock } from "./ast";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export { AstNode } from "./ast/core/AstNode";
export { CodeBlock, Type, TypeLiteral, Writer } from "./ast";
