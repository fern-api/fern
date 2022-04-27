import { HttpEndpoint } from "@fern-api/api";
import { generateTypeReference, getTextOfTsNode, withSourceFile } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/model";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
import { withEndpointDirectory } from "../utils/withEndpointDirectory";
import { generateRequestBodyReference } from "./generateRequestBodyReference";

const REQUEST_TYPE_NAME = "Request";

export function generateRequestReference({
    endpoint,
    modelDirectory,
    serviceFile,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    modelDirectory: Directory;
    serviceFile: SourceFile;
    typeResolver: TypeResolver;
}): ts.TypeNode | undefined {
    if (endpoint.parameters.length + endpoint.queryParameters.length === 0) {
        if (endpoint.request == null) {
            return undefined;
        }
        return generateRequestBodyReference({
            request: endpoint.request,
            modelDirectory,
            typeResolver,
            endpointId: endpoint.endpointId,
            serviceDirectory: serviceFile.getDirectory(),
            referencedIn: serviceFile,
        });
    }

    withEndpointDirectory(
        { endpointId: endpoint.endpointId, serviceDirectory: serviceFile.getDirectory() },
        (endpointDirectory) => {
            withSourceFile({ directory: endpointDirectory, filepath: "Request.ts" }, (requestFile) => {
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
                if (endpoint.request != null) {
                    properties.push({
                        name: "body",
                        type: getTextOfTsNode(
                            generateRequestBodyReference({
                                request: endpoint.request,
                                modelDirectory,
                                typeResolver,
                                endpointId: endpoint.endpointId,
                                referencedIn: requestFile,
                                serviceDirectory: serviceFile.getDirectory(),
                            })
                        ),
                    });
                }

                requestFile.addInterface({
                    name: "Request",
                    properties,
                    isExported: true,
                });

                serviceFile.addImportDeclaration({
                    namedImports: ["Request"],
                    moduleSpecifier: serviceFile.getRelativePathAsModuleSpecifierTo(requestFile),
                });
            });
        }
    );

    return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(REQUEST_TYPE_NAME), undefined);
}
