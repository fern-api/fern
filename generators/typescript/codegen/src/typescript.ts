import * as AST from "./ast";

export function codeblock(arg: AST.CodeBlock.Args): AST.CodeBlock {
    return new AST.CodeBlock(arg);
}

export function variable(arg: AST.Variable.Args): AST.Variable {
    return new AST.Variable(arg);
}

export function interface_(arg: AST.Interface.Args): AST.Interface {
    return new AST.Interface(arg);
}

export function namespace(arg: AST.Namespace.Args): AST.Namespace {
    return new AST.Namespace(arg);
}

export * from "./ast";
export { Type as Types } from "./ast";
export { Reference } from "./ast";
export * from "./ast/core";
