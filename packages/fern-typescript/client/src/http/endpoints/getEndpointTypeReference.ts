import { NamedType } from "@fern-api/api";
import { getTypeReference } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ServiceTypeReference } from "../../service-types/types";
import { EndpointTypeName, getLocalEndpointTypeReference } from "./getLocalEndpointTypeReference";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function getEndpointTypeReference({
    serviceName,
    endpointId,
    servicesDirectory,
    reference,
    referencedIn,
    modelDirectory,
}: {
    serviceName: NamedType;
    endpointId: string;
    referencedIn: SourceFile;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    reference: ServiceTypeReference<EndpointTypeName>;
}): ts.TypeNode {
    if (reference.isLocal) {
        return getLocalEndpointTypeReference({
            serviceName,
            endpointId,
            typeName: reference.typeName,
            referencedIn,
            servicesDirectory,
        });
    } else {
        return getTypeReference({
            reference: reference.typeReference,
            referencedIn,
            modelDirectory,
        });
    }
}
