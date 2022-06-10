import { FailedResponse, SingleUnionType } from "@fern-api/api";
import { TypeResolver } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile } from "ts-morph";
import { ClientConstants } from "../../constants";

export function generateErrorBody({
    failedResponse,
    errorBodyFile,
    errorsDirectory,
    typeResolver,
}: {
    failedResponse: FailedResponse;
    errorBodyFile: SourceFile;
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
                valueType: error.error,
            })
        ),
        typeResolver,
        baseDirectory: errorsDirectory,
        baseDirectoryType: "errors",
    });
}
