import { OpenAPI, OpenAPIV3_1 } from "openapi-types";

export function isOpenAPIV3_1(openApi: OpenAPI.Document): openApi is OpenAPIV3_1.Document {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const v3_1 = openApi as OpenAPIV3_1.Document;
    return v3_1.openapi != null && v3_1.openapi.startsWith("3.1");
}
