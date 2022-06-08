import { ResponseErrors, TypeReference } from "@fern-api/api";
import { getNamedTypeReference } from "@fern-typescript/commons";
import { generateUnionType } from "@fern-typescript/model";
import { Directory, SourceFile } from "ts-morph";
import { ClientConstants } from "../../../../constants";

export function generateErrorBody({
    errors,
    errorBodyFile,
    errorsDirectory,
}: {
    errors: ResponseErrors;
    errorBodyFile: SourceFile;
    errorsDirectory: Directory;
}): void {
    generateUnionType({
        file: errorBodyFile,
        typeName: ClientConstants.HttpService.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME,
        docs: errors.docs,
        discriminant: errors.discriminant,
        types: errors.possibleErrors.map((error) => ({
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
