import { OpenAPISpecSchema, AsyncAPIOrOpenAPISpecSchema } from "../APIConfigurationV2Schema";

export function isOpenAPISchema(spec: AsyncAPIOrOpenAPISpecSchema): spec is OpenAPISpecSchema {
    return (spec as OpenAPISpecSchema)?.openapi != null;
}
