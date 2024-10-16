import { Class, Field, ClassReference, CodeBlock, Method } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function codeBlock(args: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export { AstNode, Class, Field, Type, Writer, ClassReference, CodeBlock, Method } from "./ast";
