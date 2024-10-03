import { AsyncAPIOrOpenAPISpecSchema, ConjureSchema } from "../APIConfigurationV2Schema";

export function isConjureSchema(specs: AsyncAPIOrOpenAPISpecSchema[] | ConjureSchema): specs is ConjureSchema {
    return (specs as ConjureSchema)?.conjure != null;
}
