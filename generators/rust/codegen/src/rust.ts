import { Ternary } from "@fern-api/browser-compatible-base-generator";

import {
    Array as Array_,
    Attribute,
    CodeBlock,
    Enum,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter,
    Struct,
    StructInstantiation,
    StructReference,
    Trait
} from "./ast";
import { DataClass } from "./ast/DataClass";
import { MergeArrays } from "./ast/MergeArrays";
import { AstNode } from "./ast/core/AstNode";
import { convertToRustVariableName } from "./ast/utils/convertToRustVariableName";

export function array(args: Array_.Args): Array_ {
    return new Array_(args);
}

export function attribute(args: Attribute.Args): Attribute {
    return new Attribute(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function trait(args: Trait.Args): Trait {
    return new Trait(args);
}

export function structReference(args: StructReference.Args): StructReference {
    return new StructReference(args);
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

export function instantiateStruct(args: StructInstantiation.Args): StructInstantiation {
    return new StructInstantiation(args);
}

export function invokeMethod(args: MethodInvocation.Args): MethodInvocation {
    return new MethodInvocation(args);
}

export function throwException(args: StructInstantiation.Args): AstNode {
    return codeblock((writer) => {
        writer.write("throw ");
        writer.writeNode(instantiateStruct(args));
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
    return codeblock(convertToRustVariableName(name));
}

export function string(stringValue: string): AstNode {
    return codeblock(`"${stringValue}"`);
}

export function mergeArrays(...args: MergeArrays.Args): MergeArrays {
    return new MergeArrays(args);
}

export function this_(): AstNode {
    return new CodeBlock((writer) => {
        writer.write("$this");
    });
}

export { AstNode } from "./ast/core/AstNode";
export {
    Access,
    Array,
    Attribute,
    Struct,
    type ConstructorField,
    Trait,
    StructInstantiation,
    StructReference,
    CodeBlock,
    DataClass,
    Enum,
    Field,
    Map,
    Method,
    MethodInvocation,
    Parameter,
    Type,
    TypeLiteral,
    Writer
} from "./ast";
