import * as AST from "./ast";

export function codeblock(arg: AST.CodeBlock.Args): AST.CodeBlock {
    return new AST.CodeBlock(arg);
}

export function function_(args: AST.Function.Args): AST.Function {
    return new AST.Function(args);
}

export function instantiateClass(args: AST.ClassInstantiation.Args): AST.ClassInstantiation {
    return new AST.ClassInstantiation(args);
}

export function invokeFunction(args: AST.FunctionInvocation.Args): AST.FunctionInvocation {
    return new AST.FunctionInvocation(args);
}

export function invokeMethod(args: AST.MethodInvocation.Args): AST.MethodInvocation {
    return new AST.MethodInvocation(args);
}

export function parameter(args: AST.Parameter.Args): AST.Parameter {
    return new AST.Parameter(args);
}

export function reference(arg: AST.Reference.Args): AST.Reference {
    return new AST.Reference(arg);
}

export function variable(arg: AST.Variable.Args): AST.Variable {
    return new AST.Variable(arg);
}

export * from "./ast";
export { Type as Types, TypeLiteral, Reference } from "./ast";
export * from "./ast/core";
