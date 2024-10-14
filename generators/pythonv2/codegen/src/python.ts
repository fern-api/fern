import { Class } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export { Class } from "./ast";
export { AstNode } from "./ast/core/AstNode";
