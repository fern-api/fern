import { Class, Annotation, Variable, Type, Writer } from "./ast";

export function class_(args: Class.Args): Class {
    return new Class(args);
}

export function variable(args: Variable.Args): Variable {
    return new Variable(args);
}

export function annotation(args: Annotation.Args): Annotation {
    return new Annotation(args);
}

export { Class, Annotation, Variable, Type, Writer } from "./ast";
