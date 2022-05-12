import { ResponseErrors, TypeReference } from "@fern-api/api";
import { generateNamedTypeReference, getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";
import { ERROR_BODY_TYPE_NAME } from "./constants";

export function generateErrorBodyReference({
    errors,
    errorBodyFile,
    referencedIn,
    errorsDirectory,
}: {
    errors: ResponseErrors;
    errorBodyFile: SourceFile;
    referencedIn: SourceFile;
    errorsDirectory: Directory;
}): ts.TypeNode {
    generateUnionType({
        file: errorBodyFile,
        typeName: ERROR_BODY_TYPE_NAME,
        docs: errors.docs,
        discriminant: errors.discriminant,
        types: errors.possibleErrors.map((error) => ({
            docs: error.docs,
            discriminantValue: error.discriminantValue,
            valueType: TypeReference.named(error.error),
            resolvedValueType: {
                type: generateNamedTypeReference({
                    typeName: error.error,
                    referencedIn: errorBodyFile,
                    baseDirectory: errorsDirectory,
                    baseDirectoryType: "errors",
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
