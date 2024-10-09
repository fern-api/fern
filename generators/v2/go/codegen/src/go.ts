import {
    CodeBlock,
    Enum,
    EnumInstantiation,
    Field,
    FuncInvocation,
    GoTypeReference,
    Method,
    MethodInvocation,
    Parameter,
    Struct,
    StructInstantiation
} from "./ast";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function instantiateEnum(args: EnumInstantiation.Args): EnumInstantiation {
    return new EnumInstantiation(args);
}

export function instantiateStruct(args: StructInstantiation.Args): StructInstantiation {
    return new StructInstantiation(args);
}

export function invokeFunc(args: FuncInvocation.Args): FuncInvocation {
    return new FuncInvocation(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function typeReference(args: GoTypeReference.Args): GoTypeReference {
    return new GoTypeReference(args);
}

export { AstNode } from "./ast/core/AstNode";
export {
    CodeBlock,
    Enum,
    EnumInstantiation,
    Field,
    FuncInvocation,
    GoTypeReference as TypeReference,
    Method,
    MethodInvocation,
    Parameter,
    Struct,
    StructInstantiation,
    Type,
    TypeInstantiation,
    Writer
} from "./ast";
