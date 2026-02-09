import { OpenApiSourceSchema, SourceSchema } from "../schemas/index.js";

export function isOpenApiSourceSchema(rawSourceSchema: SourceSchema): rawSourceSchema is OpenApiSourceSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rawSourceSchema as OpenApiSourceSchema).openapi != null;
}
