import { Property, Struct } from "./ast";

export function struct(args: Struct.Args) {
    return new Struct(args);
}

export function property(args: Property.Args) {
    return new Property(args);
}

export { Type } from "./ast";
