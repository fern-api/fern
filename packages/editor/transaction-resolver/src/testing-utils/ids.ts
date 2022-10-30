import { EndpointId, ErrorId, PackageId, TypeId } from "@fern-fern/api-editor-sdk/resources";
import { v4 as uuidv4 } from "uuid";

export function generatePackageId(): PackageId {
    return uuid();
}

export function generateEndpointId(): EndpointId {
    return uuid();
}

export function generateTypeId(): TypeId {
    return uuid();
}

export function generateErrorId(): ErrorId {
    return uuid();
}

function uuid() {
    return uuidv4();
}
