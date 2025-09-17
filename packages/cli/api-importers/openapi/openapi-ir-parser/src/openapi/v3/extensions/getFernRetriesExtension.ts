import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";
import { FernOpenAPIExtension } from "./fernExtensions";


import { finalIr } from "@fern-api/openapi-ir";

interface RetriesFernExtensionSchema {
    disabled?: boolean;
    // Add other fields as needed for your schema
}

export function getFernRetriesExtension(operation: OpenAPIV3.OperationObject): finalIr.RetriesConfiguration | undefined {
    // Add logging for when we check for the extension
    // eslint-disable-next-line no-console
    console.debug("[getFernRetriesExtension] Checking for Fern retries extension on operation:", operation.operationId);

    const retriesExtension = getExtension<RetriesFernExtensionSchema>(operation, FernOpenAPIExtension.RETRIES);

    // eslint-disable-next-line no-console
    console.debug("[getFernRetriesExtension] Retrieved retries extension:", retriesExtension);

    if (retriesExtension == null) {
        // eslint-disable-next-line no-console
        console.debug("[getFernRetriesExtension] No retries extension found.");
        return undefined;
    }
    if (retriesExtension.disabled === true) {
        // eslint-disable-next-line no-console
        console.debug("[getFernRetriesExtension] Retries are disabled for this operation.");
        return finalIr.RetriesConfiguration.disabled();
    }
    // If you want to support more fields, map them here.
    // For now, only handle 'disabled'
    // eslint-disable-next-line no-console
    console.debug("[getFernRetriesExtension] Retries extension present but not handled (fields other than 'disabled').");
    return undefined;
}
