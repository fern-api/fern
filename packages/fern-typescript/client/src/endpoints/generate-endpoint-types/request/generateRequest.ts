import { HttpEndpoint } from "@fern-api/api";
import { generateTypeReference, getTextOfTsNode } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { WireMessageBodyReference } from "../types";
import { generateReferenceToWireMessageType } from "../utils";

export function generateRequest({
    requestFile,
    endpoint,
    modelDirectory,
    requestBodyReference,
}: {
    requestFile: SourceFile;
    endpoint: HttpEndpoint;
    modelDirectory: Directory;
    requestBodyReference: WireMessageBodyReference | undefined;
}): void {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        ...endpoint.parameters.map((parameter) => ({
            name: parameter.key,
            docs: parameter.docs != null ? [parameter.docs] : undefined,
            type: getTextOfTsNode(
                generateTypeReference({
                    reference: parameter.valueType,
                    referencedIn: requestFile,
                    modelDirectory,
                })
            ),
        })),
        ...endpoint.queryParameters.map((queryParameter) => ({
            name: queryParameter.key,
            docs: queryParameter.docs != null ? [queryParameter.docs] : undefined,
            type: getTextOfTsNode(
                generateTypeReference({
                    reference: queryParameter.valueType,
                    referencedIn: requestFile,
                    modelDirectory,
                })
            ),
        })),
    ];

    if (requestBodyReference != null) {
        properties.push({
            name: ClientConstants.Service.Endpoint.Types.Request.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(
                generateReferenceToWireMessageType({
                    reference: requestBodyReference,
                    referencedIn: requestFile,
                    modelDirectory,
                })
            ),
        });
    }

    requestFile.addInterface({
        name: ClientConstants.Service.Endpoint.Types.Request.TYPE_NAME,
        properties,
        isExported: true,
    });
}
