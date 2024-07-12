import {
    Annotation,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    CoreClassReference,
    Dictionary,
    Enum,
    Field,
    Method,
    Parameter,
    Type,
    MethodType
} from "./ast";
import { Interface } from "./ast/Interface";
import { MethodInvocation } from "./ast/MethodInvocation";
import { List } from "./ast/List";
import { Set } from "./ast/Set";
import { TestClass } from "./ast/TestClass";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function testClass(args: TestClass.Args): TestClass {
    return new TestClass(args);
}

export function annotation(args: Annotation.Args): Annotation {
    return new Annotation(args);
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

export function coreClassReference(args: CoreClassReference.Args): CoreClassReference {
    return new CoreClassReference(args);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
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

export function dictionary(args: Dictionary.Args): Dictionary {
    return new Dictionary(args);
}

export function list(args: List.Args): List {
    return new List(args);
}

export function set(args: Set.Args): Set {
    return new Set(args);
}

export const Types = Type;
export {
    Annotation,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Dictionary,
    Enum,
    Field,
    Method,
    MethodInvocation,
    Parameter,
    Type,
    MethodType
} from "./ast";
