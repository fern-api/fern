import { FailedResponse, PrimitiveType, SingleUnionType, TypeReference } from "@fern-api/api";
import { addUuidDependency, DependencyManager, TypeResolver } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../../constants";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    modelDirectory,
    errorsDirectory,
    typeResolver,
    dependencyManager,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): void {
    generateUnionType({
        file: errorBodyFile,
        typeName: ClientConstants.Commons.Types.Response.Error.Properties.Body.TYPE_NAME,
        docs: failedResponse.docs,
        discriminant: failedResponse.discriminant,
        types: failedResponse.errors.map(
            (error): SingleUnionType => ({
                docs: error.docs,
                discriminantValue: error.discriminantValue,
                valueType: TypeReference.named(error.error),
            })
        ),
        additionalPropertiesForEveryType: [
            {
                key: failedResponse.errorProperties.errorInstanceId,
                valueType: TypeReference.primitive(PrimitiveType.String),
                generateValueCreator: ({ file }) => {
                    file.addImportDeclaration({
                        moduleSpecifier: "uuid",
                        namespaceImport: "uuid",
                    });
                    addUuidDependency(dependencyManager);
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("uuid"),
                            ts.factory.createIdentifier("v4")
                        ),
                        undefined,
                        []
                    );
                },
            },
        ],
        typeResolver,
        modelDirectory,
        baseDirectory: errorsDirectory,
        baseDirectoryType: "errors",
    });
}
