import { ClassInstantiation, ClassReference, CodeBlock, MethodInvocation } from "./ast"
import { Class } from "./ast/Class"
import { Method } from "./ast/Method"
import { Parameter } from "./ast/Parameter"

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg)
}

export function class_(args: Class.Args): Class {
    return new Class(args)
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args)
}

export function instantiateClass(args: ClassInstantiation.Args): ClassInstantiation {
    return new ClassInstantiation(args)
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args)
}

export function method(args: Method.Args): Method {
    return new Method(args)
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args)
}

export { AstNode } from "./ast/core/AstNode"
export {
    Access,
    type BuilderParameter,
    CodeBlock,
    Class,
    ClassInstantiation,
    ClassReference,
    type ConstructorParameter,
    Method,
    MethodInvocation,
    Parameter,
    Type,
    TypeLiteral,
    Writer
} from "./ast"
