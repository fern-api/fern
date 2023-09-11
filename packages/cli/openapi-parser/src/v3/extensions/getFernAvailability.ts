import { EndpointAvailability } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { FernOpenAPIExtension } from "./fernExtensions";
import { getExtension } from "./getExtension";

export interface BasicSecuritySchemeNames {
    usernameVariable?: string;
    passwordVariable?: string;
}

export function getFernAvailability(operationObject: OpenAPIV3.OperationObject): undefined | EndpointAvailability {
    const availability = getExtension<string>(operationObject, FernOpenAPIExtension.AVAILABILITY);
    if (availability === "ga" || availability === "generally-available") {
        return EndpointAvailability.GenerallyAvailable;
    } else if (availability === "beta" || availability === "pre-release") {
        return EndpointAvailability.Beta;
    } else if (availability === "deprecated") {
        return EndpointAvailability.Deprecated;
    }
    return undefined;
}
