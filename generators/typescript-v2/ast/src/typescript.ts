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

export function func(args: AST.Func.Args): AST.Func {
    return new AST.Func(args);
}

export function method(args: AST.Method.Args): AST.Method {
    return new AST.Method(args);
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

export * from "./ast";
export { Type as Types, TypeLiteral, Reference } from "./ast";
export * from "./ast/core";
