import { AsyncApiSpecSchema, SpecSchema } from "../schemas/index.js";

export function isAsyncApiSpecSchema(spec: SpecSchema): spec is AsyncApiSpecSchema {
    return (spec as AsyncApiSpecSchema)?.asyncapi != null;
}
