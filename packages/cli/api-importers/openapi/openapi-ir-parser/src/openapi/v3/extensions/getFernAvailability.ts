import { Availability } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export interface BasicSecuritySchemeNames {
    usernameVariable?: string;
    passwordVariable?: string;
}

export function getFernAvailability(operationObject: OpenAPIV3.OperationObject): undefined | Availability {
    const availability = getExtension<string>(operationObject, FernOpenAPIExtension.AVAILABILITY);
    if (availability === "ga" || availability === "generally-available") {
        return Availability.GenerallyAvailable;
    } else if (availability === "beta" || availability === "pre-release") {
        return Availability.Beta;
    } else if (availability === "deprecated") {
        return Availability.Deprecated;
    }
    if (operationObject.deprecated) {
        return Availability.Deprecated;
    }
    return undefined;
}
