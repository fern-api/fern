import { HttpEndpoint } from "@fern-api/api";
import { withSourceFile } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";
import { generateRequestReference } from "./request/generateRequestReference";
import { addResponse } from "./response/addResponse";
import { withEndpointDirectory } from "./utils/withEndpointDirectory";

export interface EndpointSignature {
    parameters: ts.ParameterDeclaration[];
    returnType: ts.TypeNode;
}

export function createEndpointSignature({
    endpoint,
    serviceFile,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    serviceFile: SourceFile;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
}): EndpointSignature {
    const requestType = generateRequestReference({
        endpoint,
        serviceFile,
        modelDirectory,
        typeResolver,
    });

    const parameters =
        requestType != null
            ? [
                  ts.factory.createParameterDeclaration(
                      undefined,
                      undefined,
                      undefined,
                      "request",
                      undefined,
                      requestType
                  ),
              ]
            : [];

    withEndpointDirectory(
        { serviceDirectory: serviceFile.getDirectory(), endpointId: endpoint.endpointId },
        (endpointDirectory) => {
            withSourceFile({ directory: endpointDirectory, filepath: "Response.ts" }, (responseFile) => {
                addResponse({
                    endpoint,
                    modelDirectory,
                    errorsDirectory,
                    typeResolver,
                    responseFile,
                });

                serviceFile.addImportDeclaration({
                    namedImports: ["Response"],
                    moduleSpecifier: serviceFile.getRelativePathAsModuleSpecifierTo(responseFile),
                });
            });
        }
    );

    const returnType = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
        ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier("endpoints"),
                    ts.factory.createIdentifier(endpoint.endpointId)
                ),
                ts.factory.createIdentifier("Response")
            ),
            undefined
        ),
    ]);

    return { parameters, returnType };
}
