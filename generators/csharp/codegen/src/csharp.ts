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
    String_,
    Switch,
    Ternary,
    TestClass,
    TypeParameter
} from "./ast";
import { ReadOnlyMemory } from "./ast/ReadOnlymemory";
import { XmlDocBlock } from "./ast/XmlDocBlock";
import { nameRegistry } from "./utils/nameRegistry";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function testClass(args: TestClass.Args): TestClass {
    return new TestClass(args);
}

export function annotation(args: Annotation.Args): Annotation {
    return new Annotation(args);
}

let frozen = false;
export function freezeClassReferences() {
    frozen = true;
}

function stacktrace(): { fn: string; path: string; position: string }[] {
    return (new Error().stack ?? "")
        .split("\n")
        .map((line) => {
            const match = line.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
            if (match && match.length === 5) {
                let [, fn, path, line, column] = match;
                return { fn: fn === "Object.<anonymous>" ? "" : fn, path, position: `${line}:${column}` };
            }
            return undefined;
        })
        .filter((each) => 
          each && 
        "stacktrace" !== each.fn 
        && !each.path?.startsWith("node:") 
        && !each.path?.endsWith(".js")
        && each.fn !== "Object.classReference"
      ) as {
        fn: string;
        path: string;
        position: string;
    }[];
}

export function classReference(args: ClassReference.Args): ClassReference {
    if (frozen) {
        // check if the class reference is already known
        const fullyQualifiedName = nameRegistry.normalizeClassReference({
            name: args.name,
            namespace: args.namespace,
            enclosingType: args.enclosingType
        });
        if (!nameRegistry.isRegistered(fullyQualifiedName)) {
            // this means we haven't seen this before
            // write it out as an error so we can find them
            console.log( `${fullyQualifiedName} -\n${stacktrace().map(each => `   ${each.fn} - ${each.path}:${each.position}`).join("\n")}`);
        }
    }
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

export function xmlDocBlock(arg: XmlDocBlock.Arg): XmlDocBlock {
    return new XmlDocBlock(arg);
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

export function typeParameter(args: string | TypeParameter.Args): TypeParameter {
    if (typeof args === "string") {
        args = { name: args };
    }
    return new TypeParameter(args);
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

export function string_(args: String_.Args): String_ {
    return new String_(args);
}

export {
    Access,
    Annotation,
    AnonymousFunction,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    convertReadOnlyPrimitiveTypes,
    Dictionary,
    Enum,
    Field,
    InstantiatedPrimitive,
    Interface,
    Method,
    MethodInvocation,
    MethodType,
    Parameter,
    String_,
    Type,
    Type as Types,
    TypeLiteral,
    TypeParameter,
    VALID_READ_ONLY_MEMORY_TYPES,
    Writer
} from "./ast";
export { AstNode } from "./ast/core/AstNode";
export { type ConstructorField } from "./ast/TypeLiteral";
export { System } from "./utils/builtIn";
