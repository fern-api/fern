import { AsyncApiOrOpenApiSpecSchema, ConjureSchema } from "../schemas";

export function isConjureSchema(specs: AsyncApiOrOpenApiSpecSchema[] | ConjureSchema): specs is ConjureSchema {
    return (specs as ConjureSchema)?.conjure != null;
}
