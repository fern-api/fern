import { Annotation, Class, ClassReference, CodeBlock, Enum, Field, Method, Parameter, Type } from "./ast";
import { Interface } from "./ast/Interface";

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

export function interface_(args: Interface.Args): Interface {
    return new Interface(args);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
}

export const Types = Type;
export { Class, ClassReference, CodeBlock, Enum, Type } from "./ast";
