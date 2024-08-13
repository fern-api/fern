import { CodeBlock } from "./CodeBlock";

export type Argument = NamedArgument | UnnamedArgument;

export type Arguments = NamedArgument[] | UnnamedArgument[];

export interface NamedArgument {
    name: string;
    assignment: CodeBlock;
}

export type UnnamedArgument = CodeBlock;

export function isNamedArgument(argument: NamedArgument | UnnamedArgument): argument is NamedArgument {
    return (argument as NamedArgument)?.name != null;
}
