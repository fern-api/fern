import { finalIr } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";

interface RetriesFernExtensionSchema {
    disabled?: boolean;
    // Add other fields as needed for your schema
}

export function getFernRetriesExtension(
    operation: OpenAPIV3.OperationObject
): finalIr.RetriesConfiguration | undefined {
    const retriesExtension = getExtension<RetriesFernExtensionSchema>(operation, FernOpenAPIExtension.RETRIES);

    if (retriesExtension == null) {
        return undefined;
    }
    if (retriesExtension.disabled === true) {
        return finalIr.RetriesConfiguration.disabled(retriesExtension.disabled);
    }
    // If you want to support more fields, map them here.
    // For now, only handle 'disabled'
    return undefined;
}
