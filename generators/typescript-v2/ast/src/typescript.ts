import * as AST from "./ast";

export function codeblock(arg: AST.CodeBlock.Args): AST.CodeBlock {
    return new AST.CodeBlock(arg);
}

export function variable(arg: AST.Variable.Args): AST.Variable {
    return new AST.Variable(arg);
}

export function reference(arg: AST.Reference.Args): AST.Reference {
    return new AST.Reference(arg);
}

export * from "./ast";
export { Type as Types, TypeLiteral, Reference } from "./ast";
export * from "./ast/core";
