import { OpenApiSpecSchema, SpecSchema } from "../schemas/index.js";

export function isOpenApiSpecSchema(spec: SpecSchema): spec is OpenApiSpecSchema {
    return (spec as OpenApiSpecSchema)?.openapi != null;
}
