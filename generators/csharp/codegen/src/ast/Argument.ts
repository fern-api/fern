import { AstNode } from "./core/AstNode";

export type Argument = NamedArgument | UnnamedArgument;

export type Arguments = NamedArgument[] | UnnamedArgument[];

export interface NamedArgument {
    name: string;
    assignment: AstNode;
}

export type UnnamedArgument = AstNode;

export function isNamedArgument(argument: NamedArgument | UnnamedArgument): argument is NamedArgument {
    return (argument as NamedArgument)?.name != null;
}
