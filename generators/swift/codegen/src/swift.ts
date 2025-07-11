import { EnumWithAssociatedValues, Property, Struct } from "./ast";

export function enumWithAssociatedValues(args: EnumWithAssociatedValues.Args): EnumWithAssociatedValues {
    return new EnumWithAssociatedValues(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function property(args: Property.Args): Property {
    return new Property(args);
}

export * from "./ast";
