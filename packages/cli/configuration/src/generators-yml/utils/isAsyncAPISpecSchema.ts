import { AsyncAPISchema, AsyncAPIOrOpenAPISpecSchema } from "../APIConfigurationV2Schema";

export function isAsyncAPISchema(spec: AsyncAPIOrOpenAPISpecSchema): spec is AsyncAPISchema {
    return (spec as AsyncAPISchema)?.asyncapi != null;
}
