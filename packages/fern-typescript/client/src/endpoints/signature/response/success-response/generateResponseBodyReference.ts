import { WireMessage } from "@fern-api/api";
import { assertNever, generateTypeReference, withSourceFile } from "@fern-typescript/commons";
import { generateType, TypeResolver } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";

const RESPONSE_BODY_TYPE_NAME = "ResponseBody";

export function generateResponseBodyReference({
    response,
    modelDirectory,
    typeResolver,
    responseFile,
}: {
    response: WireMessage;
    modelDirectory: Directory;
    responseFile: SourceFile;
    typeResolver: TypeResolver;
}): ts.TypeNode {
    switch (response.type._type) {
        case "alias":
            return generateTypeReference({
                reference: response.type.aliasOf,
                referencedIn: responseFile,
                modelDirectory,
            });
        case "object":
        case "union":
        case "enum":
            withSourceFile(
                { directory: responseFile.getDirectory(), filepath: `${RESPONSE_BODY_TYPE_NAME}.ts` },
                (responseBodyFile) => {
                    generateType({
                        type: response.type,
                        docs: response.docs,
                        typeName: RESPONSE_BODY_TYPE_NAME,
                        typeResolver,
                        modelDirectory,
                        file: responseBodyFile,
                    });

                    responseFile.addImportDeclaration({
                        namedImports: [RESPONSE_BODY_TYPE_NAME],
                        moduleSpecifier: responseFile.getRelativePathAsModuleSpecifierTo(responseBodyFile),
                    });
                }
            );
            return ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(RESPONSE_BODY_TYPE_NAME), undefined);
        default:
            assertNever(response.type);
    }
}
