import { HttpEndpoint, TypeReference } from "@fern-api/api";
import { generateNamedTypeReference, getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";
import { ERROR_BODY_TYPE_NAME } from "./constants";

export function generateErrorBodyReference({
    endpoint,
    errorBodyFile,
    referencedIn,
    errorsDirectory,
}: {
    endpoint: HttpEndpoint;
    errorBodyFile: SourceFile;
    referencedIn: SourceFile;
    errorsDirectory: Directory;
}): ts.TypeNode {
    generateUnionType({
        file: errorBodyFile,
        typeName: ERROR_BODY_TYPE_NAME,
        docs: endpoint.errors.docs,
        discriminant: endpoint.errors.discriminant,
        types: endpoint.errors.possibleErrors.map((error) => ({
            docs: error.docs,
            discriminantValue: error.discriminantValue,
            valueType: TypeReference.named(error.error),
            resolvedValueType: {
                type: generateNamedTypeReference({
                    typeName: error.error,
                    referencedIn: errorBodyFile,
                    baseDirectory: errorsDirectory,
                }),
                isExtendable: true,
            },
        })),
    });

    referencedIn.addImportDeclaration({
        namedImports: [ERROR_BODY_TYPE_NAME],
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, errorBodyFile),
    });

    return ts.factory.createTypeReferenceNode(ERROR_BODY_TYPE_NAME);
}
