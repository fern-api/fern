import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

export interface AsyncFernExtensionSchema {
    discriminant: {
        name: string;
        value: string;
    };
    "response-status-code": number;
}

export function getFernAsyncExtension(operation: OpenAPIV3.OperationObject): AsyncFernExtensionSchema | undefined {
    return getExtension<AsyncFernExtensionSchema>(operation, FernOpenAPIExtension.ASYNC_CONFIG);
}
