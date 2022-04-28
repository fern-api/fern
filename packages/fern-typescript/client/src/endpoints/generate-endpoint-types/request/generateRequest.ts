import { HttpEndpoint } from "@fern-api/api";
import { generateTypeReference, getTextOfTsNode } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
import { REQUEST_BODY_PROPERTY_NAME, REQUEST_TYPE_NAME } from "./constants";

export function generateRequest({
    requestFile,
    endpoint,
    modelDirectory,
    requestBodyReference,
}: {
    requestFile: SourceFile;
    endpoint: HttpEndpoint;
    modelDirectory: Directory;
    requestBodyReference: ts.TypeNode | undefined;
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
            name: REQUEST_BODY_PROPERTY_NAME,
            type: getTextOfTsNode(requestBodyReference),
        });
    }

    requestFile.addInterface({
        name: REQUEST_TYPE_NAME,
        properties,
        isExported: true,
    });
}
