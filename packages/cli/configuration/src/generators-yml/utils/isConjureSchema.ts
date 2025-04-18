import { ConjureSchema, SpecSchema } from "../schemas";

export function isConjureSchema(specs: SpecSchema[] | ConjureSchema): specs is ConjureSchema {
    return (specs as ConjureSchema)?.conjure != null;
}
