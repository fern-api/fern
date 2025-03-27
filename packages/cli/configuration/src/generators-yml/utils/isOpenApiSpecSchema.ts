import { OpenApiSpecSchema, SpecSchema } from "../schemas";

export function isOpenApiSpecSchema(spec: SpecSchema): spec is OpenApiSpecSchema {
    return (spec as OpenApiSpecSchema)?.openapi != null;
}
