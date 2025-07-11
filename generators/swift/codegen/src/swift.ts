import { Enum, Property, Struct } from "./ast";

export function enum_(args: Enum.Args): Enum {
    return new Enum(args);
}

export function struct(args: Struct.Args): Struct {
    return new Struct(args);
}

export function property(args: Property.Args): Property {
    return new Property(args);
}

export * from "./ast";
