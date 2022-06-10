import { FailedResponse, TypeReference } from "@fern-api/api";
import { getNamedTypeReference } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile } from "ts-morph";
import { ClientConstants } from "../../constants";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    errorsDirectory,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
    errorsDirectory: Directory;
}): void {
    generateUnionType({
        file: errorBodyFile,
        typeName: ClientConstants.Commons.Types.Response.Error.Properties.Body.TYPE_NAME,
        docs: failedResponse.docs,
        discriminant: failedResponse.discriminant,
        types: failedResponse.errors.map((error) => ({
            docs: error.docs,
            discriminantValue: error.discriminantValue,
            valueType: TypeReference.named(error.error),
            resolvedValueType: {
                type: getNamedTypeReference({
                    typeName: error.error,
                    referencedIn: errorBodyFile,
                    baseDirectory: errorsDirectory,
                    baseDirectoryType: "errors",
                }),
                isExtendable: true,
            },
        })),
    });
}
