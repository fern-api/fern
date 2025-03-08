import { ClassInstantiation, ClassReference, CodeBlock, MethodInvocation } from "./ast";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export { AstNode } from "./ast/core/AstNode";
export { CodeBlock, ClassInstantiation, ClassReference, MethodInvocation, Type, TypeLiteral, Writer } from "./ast";
