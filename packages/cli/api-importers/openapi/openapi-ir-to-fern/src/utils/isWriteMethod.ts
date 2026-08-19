import { FernOpenapiIr } from "@fern-api/openapi-ir";

export function isWriteMethod(method: FernOpenapiIr.HttpMethod): boolean | undefined {
    return method === "POST" || method === "PUT" || method === "PATCH";
}
