import {
    CodeBlock,
    KeywordParameter,
    KeywordSplatParameter,
    Method,
    PositionalParameter,
    PositionalSplatParameter,
    YieldParameter
} from "./ast";

export { AstNode } from "./ast/core/AstNode";
export { CodeBlock, Parameter, Method } from "./ast";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

/*
Helper for positional parameters -- most of the time when you're talking about a "parameter" in Ruby, you're talking
about positional parameters
*/
export function parameter(args: PositionalParameter.Args): PositionalParameter {
    return new PositionalParameter(args);
}

export function positionalParameter(args: PositionalParameter.Args): PositionalParameter {
    return new PositionalParameter(args);
}

export function keywordParameter(args: KeywordParameter.Args): KeywordParameter {
    return new KeywordParameter(args);
}

export function positionalSplatParameter(args: PositionalSplatParameter.Args): PositionalSplatParameter {
    return new PositionalSplatParameter(args);
}

export function keywordSplatParameter(args: KeywordSplatParameter.Args): KeywordSplatParameter {
    return new KeywordSplatParameter(args);
}

export function yieldParameter(args: YieldParameter.Args): YieldParameter {
    return new YieldParameter(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}
