import { TypeName } from "@fern-api/api";
import { getTypeReference } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ServiceTypeReference } from "../types";
import { getLocalServiceTypeReference } from "./getLocalServiceTypeReference";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function getServiceTypeReference({
    serviceOrChannelName,
    endpointOrOperationId,
    servicesDirectory,
    reference,
    referencedIn,
    modelDirectory,
}: {
    serviceOrChannelName: TypeName;
    endpointOrOperationId: string;
    referencedIn: SourceFile;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    reference: ServiceTypeReference;
}): ts.TypeNode {
    if (reference.isLocal) {
        return getLocalServiceTypeReference({
            serviceOrChannelName,
            endpointOrOperationId,
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
