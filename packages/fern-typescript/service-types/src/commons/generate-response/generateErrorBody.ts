import { FailedResponse, PrimitiveType, SingleUnionType, TypeReference } from "@fern-api/api";
import { addUuidDependency, DependencyManager, TypeResolver } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/types";
import { Directory, SourceFile, ts } from "ts-morph";
import { ServiceTypesConstants } from "../../constants";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    modelDirectory,
    typeResolver,
    dependencyManager,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): void {
    generateUnionType({
        file: errorBodyFile,
        typeName: ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
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
    });
}
