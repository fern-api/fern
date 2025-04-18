import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { convertObj } from "swagger2openapi";

export async function convertOpenAPIV2ToV3(openAPI: OpenAPIV2.Document): Promise<OpenAPIV3.Document> {
    const conversionResult = await convertObj(openAPI, {});
    return conversionResult.openapi;
}
