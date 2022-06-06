import { NamedType } from "@fern-api/api";
import { generateTypeReference } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { generateEndpointTypeReference } from "../generateEndpointTypeReference";
import { WireMessageBodyReference } from "./types";

// adds an import to the `referencedIn` file and returns a reference to the imported type
export function generateReferenceToWireMessageType({
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
    reference: WireMessageBodyReference;
}): ts.TypeNode {
    if (reference.isLocal) {
        return generateEndpointTypeReference({
            serviceName,
            endpointId,
            typeName: reference.typeName,
            referencedIn,
            servicesDirectory,
        });
    } else {
        return generateTypeReference({
            reference: reference.typeReference,
            referencedIn,
            modelDirectory,
        });
    }
}
