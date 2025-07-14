import { CodeBlock, EnumWithAssociatedValues, EnumWithRawValues, Method, Property, Struct } from "./ast";

export function codeBlock(args: CodeBlock.Args): CodeBlock {
    return new CodeBlock(args);
}

export function enumWithAssociatedValues(args: EnumWithAssociatedValues.Args): EnumWithAssociatedValues {
    return new EnumWithAssociatedValues(args);
}

export function enumWithRawValues(args: EnumWithRawValues.Args): EnumWithRawValues {
    return new EnumWithRawValues(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function property(args: Property.Args): Property {
    return new Property(args);
}

export function method(args: Method.Args): Method {
    return new Method(args);
}

export * from "./ast";
