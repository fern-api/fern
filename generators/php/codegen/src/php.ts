import { Ternary } from "@fern-api/base-generator";

import {
    Array as Array_,
    Attribute,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Enum,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter,
    Trait
} from "./ast";
import { DataClass } from "./ast/DataClass";

export function array(args: Array_.Args): Array_ {
    return new Array_(args);
}

export function attribute(args: Attribute.Args): Attribute {
    return new Attribute(args);
}

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function trait(args: Trait.Args): Trait {
    return new Trait(args);
}

export function classReference(args: ClassReference.Args): ClassReference {
    return new ClassReference(args);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function dataClass(args: DataClass.Args): DataClass {
    return new DataClass(args);
}

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
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

export function ternary(args: Ternary.Args): Ternary {
    return new Ternary(args);
}

export { AstNode } from "./ast/core/AstNode";
export {
    Array,
    Attribute,
    Class,
    Trait,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Enum,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter,
    Type,
    Writer
} from "./ast";
