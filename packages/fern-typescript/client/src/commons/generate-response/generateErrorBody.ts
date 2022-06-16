import { FailedResponse, PrimitiveType, SingleUnionType, TypeReference } from "@fern-api/api";
import { TypeResolver } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile } from "ts-morph";
import { ClientConstants } from "../../constants";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
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
        additionalProperties: [
            {
                key: failedResponse.errorProperties.errorInstanceId,
                valueType: TypeReference.primitive(PrimitiveType.String),
            },
        ],
        typeResolver,
        modelDirectory,
        baseDirectory: errorsDirectory,
        baseDirectoryType: "errors",
    });
}
