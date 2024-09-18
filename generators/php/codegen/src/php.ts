import {
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter
} from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function map(args: Map.Args): Map {
    return new Map(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

export { AstNode } from "./ast/core/AstNode";
export {
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter,
    Type,
    Writer
} from "./ast";
