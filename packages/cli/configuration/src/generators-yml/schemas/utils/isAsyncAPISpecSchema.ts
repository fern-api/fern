import { AsyncAPISchema, SpecSchema } from "../APIConfigurationV2Schema";

export function isAsyncAPISchema(spec: SpecSchema): spec is AsyncAPISchema {
    return (spec as AsyncAPISchema)?.asyncapi != null;
}
