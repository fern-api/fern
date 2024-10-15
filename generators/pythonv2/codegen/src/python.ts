import { Class, Annotation, Field, Type, Writer } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function field(args: Field.Args): Field {
    return new Field(args);
}

export function annotation(args: Annotation.Args): Annotation {
    return new Annotation(args);
}

export { Class, Annotation, Field, Type, Writer } from "./ast";
