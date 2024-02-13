import { Annotation, Class, ClassReference, CodeBlock, Field, Method, Parameter, Type } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function annotation(args: Annotation.Args): Annotation {
    return new Annotation(args);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function codeblock(args: CodeBlock.Args): CodeBlock {
    return new CodeBlock(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

export const Types = Type;
