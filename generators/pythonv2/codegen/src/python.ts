import { Class, Field, Type, Writer, ClassReference } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function classReference(name: string, modulePath: string[]): ClassReference {
    return new ClassReference(name, modulePath);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export { Class, Field, Type, Writer } from "./ast";
