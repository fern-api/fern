import { AbstractAstNode } from "./AbstractAstNode";

export type Argument = NamedArgument | UnnamedArgument;

export type Arguments = NamedArgument[] | UnnamedArgument[];

export interface NamedArgument {
    name: string;
    assignment: AbstractAstNode | string;
    docs?: string;
}

export type UnnamedArgument = AbstractAstNode;

export function isNamedArgument(argument: NamedArgument | UnnamedArgument): argument is NamedArgument {
    return (argument as NamedArgument)?.name != null && (argument as NamedArgument)?.assignment != null;
}

export function hasNamedArgument(arguments_: Arguments): boolean {
    return arguments_.length > 0 && arguments_[0] != null && isNamedArgument(arguments_[0]);
}
