import {
    And,
    Annotation,
    AnonymousFunction,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    CoreClassReference,
    Dictionary,
    Enum,
    EnumInstantiation,
    Field,
    Interface,
    List,
    Method,
    MethodInvocation,
    Or,
    Parameter,
    Set,
    Switch,
    Ternary,
    TestClass
} from "./ast";
import { ReadOnlyMemory } from "./ast/ReadOnlymemory";

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

export function anonymousFunction(args: AnonymousFunction.Args): AnonymousFunction {
    return new AnonymousFunction(args);
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

export function readOnlyMemory(args: ReadOnlyMemory.Args): ReadOnlyMemory {
    return new ReadOnlyMemory(args);
}

export function set(args: Set.Args): Set {
    return new Set(args);
}

export function switch_(args: Switch.Args): Switch {
    return new Switch(args);
}

export function ternary(args: Ternary.Args): Ternary {
    return new Ternary(args);
}

export function and(args: And.Args): And {
    return new And(args);
}

export function or(args: Or.Args): Or {
    return new Or(args);
}

export function enumInstantiation(args: EnumInstantiation.Args): EnumInstantiation {
    return new EnumInstantiation(args);
}

export {
    Annotation,
    Access,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    Dictionary,
    Enum,
    Field,
    InstantiatedPrimitive,
    Method,
    AnonymousFunction,
    MethodInvocation,
    MethodType,
    Parameter,
    Type,
    Type as Types,
    Writer,
    VALID_READ_ONLY_MEMORY_TYPES,
    convertReadOnlyPrimitiveTypes
} from "./ast";
export { AstNode } from "./ast/core/AstNode";
