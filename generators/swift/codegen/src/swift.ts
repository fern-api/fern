import { Property, Struct } from "./ast";

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function property(args: Property.Args): Property {
    return new Property(args);
}

export * from "./ast";
