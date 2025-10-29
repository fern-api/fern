import { Ternary } from "@fern-api/browser-compatible-base-generator";

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
import { AstNode } from "./ast/core/AstNode";
import { DataClass } from "./ast/DataClass";
import { MergeArrays } from "./ast/MergeArrays";
import { convertToPhpVariableName } from "./ast/utils/convertToPhpVariableName";

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

export function throwException(args: ClassInstantiation.Args): AstNode {
    return codeblock((writer) => {
        writer.write("throw ");
        writer.writeNode(instantiateClass(args));
    });
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

export function assignVariable(variableRef: AstNode, variableValue: string | AstNode): AstNode {
    return codeblock((writer) => {
        writer.writeNodeOrString(variableRef);
        writer.write(" = ");
        writer.writeNodeOrString(variableValue);
    });
}

export function variable(name: string): AstNode {
    return codeblock(convertToPhpVariableName(name));
}

export function string(stringValue: string): AstNode {
    return codeblock(`"${stringValue}"`);
}

export function mergeArrays(...args: MergeArrays.Args): MergeArrays {
    return new MergeArrays(args);
}

/**
 * Escapes a string for safe usage in PHP code (e.g., enum values, string literals).
 */
export function escapePhpString(str: string): string {
    return str
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/\$/g, "\\$");
}

export function this_(): AstNode {
    return new CodeBlock((writer) => {
        writer.write("$this");
    });
}

export {
    Access,
    Array,
    Attribute,
    Class,
    ClassInstantiation,
    ClassReference,
    CodeBlock,
    type ConstructorField,
    DataClass,
    Enum,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter,
    Trait,
    Type,
    TypeLiteral,
    Writer
} from "./ast";
export { AstNode } from "./ast/core/AstNode";
