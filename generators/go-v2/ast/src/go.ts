import {
    Alias,
    CodeBlock,
    Enum,
    Field,
    File,
    Func,
    FuncInvocation,
    GoTypeReference,
    Identifier,
    Method,
    MethodInvocation,
    Parameter,
    Pointer,
    Selector,
    Struct,
    Switch,
    TypeDeclaration
} from "./ast";

export function alias(args: Alias.Args): Alias {
    return new Alias(args);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function file(args: File.Args = {}): File {
    return new File(args);
}

export function func(args: Func.Args): Func {
    return new Func(args);
}

export function identifier(args: Identifier.Args): Identifier {
    return new Identifier(args);
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

export function pointer(args: Pointer.Args): Pointer {
    return new Pointer(args);
}

export function selector(args: Selector.Args): Selector {
    return new Selector(args);
}

export function struct(args: Struct.Args = {}): Struct {
    return new Struct(args);
}

export function switch_(args: Switch.Args): Switch {
    return new Switch(args);
}

export function typeDeclaration(args: TypeDeclaration.Args): TypeDeclaration {
    return new TypeDeclaration(args);
}

export function typeReference(args: GoTypeReference.Args): GoTypeReference {
    return new GoTypeReference(args);
}

export {
    Alias,
    CodeBlock,
    Enum,
    Field,
    File,
    Func,
    FuncInvocation,
    GoTypeReference as TypeReference,
    IoReaderTypeReference,
    Method,
    MethodInvocation,
    MultiNode,
    Parameter,
    Pointer,
    Selector,
    Struct,
    type StructField,
    TimeTypeReference,
    Type,
    TypeDeclaration,
    TypeInstantiation,
    UuidTypeReference,
    Writer
} from "./ast";
export { AstNode } from "./ast/core/AstNode";
