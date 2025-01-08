import { AsyncApiOrOpenApiSpecSchema, OpenApiSpecSchema } from "../schemas";

export function isOpenAPISchema(spec: AsyncApiOrOpenApiSpecSchema): spec is OpenApiSpecSchema {
    return (spec as OpenApiSpecSchema)?.openapi != null;
}
