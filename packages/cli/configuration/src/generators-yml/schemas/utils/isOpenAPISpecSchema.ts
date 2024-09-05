import { OpenAPISpecSchema, SpecSchema } from "../APIConfigurationV2Schema";

export function isOpenAPISchema(spec: SpecSchema): spec is OpenAPISpecSchema {
    return (spec as OpenAPISpecSchema)?.openapi != null;
}
