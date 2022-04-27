import { HttpEndpoint } from "@fern-api/api";
import { TypeResolver } from "@fern-typescript/model";
import { Directory, SourceFile, Writers } from "ts-morph";
import { addErrorResponse } from "./error-response/addErrorResponse";
import { addSuccessResponse } from "./success-response/addSuccessResponse";

export function addResponse({
    endpoint,
    modelDirectory,
    errorsDirectory,
    typeResolver,
    responseFile,
}: {
    endpoint: HttpEndpoint;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
    responseFile: SourceFile;
}): void {
    responseFile.addTypeAlias({
        name: "Response",
        type: Writers.unionType("SuccessResponse", "ErrorResponse"),
        isExported: true,
    });

    addSuccessResponse({
        endpoint,
        responseFile,
        modelDirectory,
        typeResolver,
    });

    addErrorResponse({
        endpoint,
        responseFile,
        errorsDirectory,
    });
}
