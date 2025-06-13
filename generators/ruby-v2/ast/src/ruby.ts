import {
    Class_,
    CodeBlock,
    Comment,
    Field,
    KeywordParameter,
    KeywordSplatParameter,
    Method,
    Module,
    Object_,
    PositionalParameter,
    PositionalSplatParameter,
    YieldParameter
} from "./ast";
import { TypeParameter } from "./ast/TypeParameter";

export { AstNode } from "./ast/core/AstNode";
export { CodeBlock, Parameter, Method, Type } from "./ast";

export function codeblock(arg: CodeBlock.Arg): CodeBlock {
    return new CodeBlock(arg);
}

export const parameters = {
    positional(args: PositionalParameter.Args): PositionalParameter {
        return new PositionalParameter(args);
    },

    keyword(args: KeywordParameter.Args): KeywordParameter {
        return new KeywordParameter(args);
    },

    positionalSplat(args: PositionalSplatParameter.Args): PositionalSplatParameter {
        return new PositionalSplatParameter(args);
    },

    keywordSplat(args: KeywordSplatParameter.Args): KeywordSplatParameter {
        return new KeywordSplatParameter(args);
    },

    yield(args: YieldParameter.Args): YieldParameter {
        return new YieldParameter(args);
    }
} as const;

export function class_(args: Class_.Args): Class_ {
    return new Class_(args);
}

export function module(args: Module.Args): Module {
    return new Module(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function comment(args: Comment.Args): Comment {
    return new Comment(args);
}

export function object_(args: Object_.Args): Object_ {
    return new Object_(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function typeParameter(args: TypeParameter.Args): TypeParameter {
    return new TypeParameter(args);
}
