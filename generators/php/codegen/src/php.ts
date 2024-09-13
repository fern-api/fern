import { Class, CodeBlock, Field, Parameter } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function parameter(args: Parameter.Args): Parameter {
    return new Parameter(args);
}

export { AstNode } from "./ast/core/AstNode";
export { Class, CodeBlock, Field, Parameter, Type, Writer } from "./ast";
