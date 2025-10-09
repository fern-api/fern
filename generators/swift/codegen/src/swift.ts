import {
    Class,
    CodeBlock,
    Comment,
    ComputedProperty,
    DocComment,
    EnumWithAssociatedValues,
    EnumWithRawValues,
    Extension,
    FunctionArgument,
    FunctionParameter,
    Initializer,
    Method,
    Property,
    Struct
} from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function codeBlock(args: CodeBlock.Args): CodeBlock {
    return new CodeBlock(args);
}

export function comment(args: Comment.Args): Comment {
    return new Comment(args);
}

export function computedProperty(args: ComputedProperty.Args): ComputedProperty {
    return new ComputedProperty(args);
}

export function docComment(args: DocComment.Args): DocComment {
    return new DocComment(args);
}

export function enumWithAssociatedValues(args: EnumWithAssociatedValues.Args): EnumWithAssociatedValues {
    return new EnumWithAssociatedValues(args);
}

export function enumWithRawValues(args: EnumWithRawValues.Args): EnumWithRawValues {
    return new EnumWithRawValues(args);
}

export function extension(args: Extension.Args): Extension {
    return new Extension(args);
}

export function functionArgument(args: FunctionArgument.Args): FunctionArgument {
    return new FunctionArgument(args);
}

export function functionParameter(args: FunctionParameter.Args): FunctionParameter {
    return new FunctionParameter(args);
}

export function initializer(args: Initializer.Args): Initializer {
    return new Initializer(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export function property(args: Property.Args): Property {
    return new Property(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export * from "./ast";
export * from "./symbol";
