import { WireMessage } from "@fern-api/api";
import { assertNever, generateTypeReference, withSourceFile } from "@fern-typescript/commons";
import { generateType, TypeResolver } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";
import { withEndpointDirectory } from "../utils/withEndpointDirectory";

const REQUEST_TYPE_NAME = "RequestBody";
const ENDPOINTS_NAMESPACE_IMPORT = "endpoints";

export function generateRequestBodyReference({
    endpointId,
    request,
    modelDirectory,
    serviceDirectory,
    referencedIn,
    typeResolver,
}: {
    endpointId: string;
    request: WireMessage;
    modelDirectory: Directory;
    serviceDirectory: Directory;
    referencedIn: SourceFile;
    typeResolver: TypeResolver;
}): ts.TypeNode {
    switch (request.type._type) {
        case "alias":
            return generateTypeReference({
                reference: request.type.aliasOf,
                referencedIn,
                modelDirectory,
            });
        case "object":
        case "union":
        case "enum":
            withEndpointDirectory({ endpointId, serviceDirectory }, (endpointDirectory) => {
                withSourceFile(
                    { directory: endpointDirectory, filepath: `${REQUEST_TYPE_NAME}.ts` },
                    (wireMessageFile) => {
                        generateType({
                            type: request.type,
                            docs: request.docs,
                            typeName: REQUEST_TYPE_NAME,
                            typeResolver,
                            modelDirectory,
                            file: wireMessageFile,
                        });

                        referencedIn.addImportDeclaration({
                            namespaceImport: ENDPOINTS_NAMESPACE_IMPORT,
                            moduleSpecifier: referencedIn.getRelativePathAsModuleSpecifierTo(
                                endpointDirectory.getParentOrThrow()
                            ),
                        });
                    }
                );
            });
            return ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(ENDPOINTS_NAMESPACE_IMPORT),
                        ts.factory.createIdentifier(endpointId)
                    ),
                    ts.factory.createIdentifier(REQUEST_TYPE_NAME)
                ),
                undefined
            );
        default:
            assertNever(request.type);
    }
}
