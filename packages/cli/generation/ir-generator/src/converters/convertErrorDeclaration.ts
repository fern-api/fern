import { RawSchemas } from "@fern-api/yaml-schema";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { FernFileContext } from "../FernFileContext";
import { TypeResolver } from "../type-resolver/TypeResolver";
import { generateWireStringWithAllCasings } from "../utils/generateCasings";
import { convertType } from "./type-declarations/convertTypeDeclaration";

export function convertErrorDeclaration({
    errorName,
    errorDeclaration,
    file,
    typeResolver,
}: {
    errorName: string;
    errorDeclaration: RawSchemas.ErrorDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): ErrorDeclaration {
    return {
        name: {
            name: errorName,
            fernFilepath: file.fernFilepath,
        },
        discriminantValue: generateWireStringWithAllCasings({
            wireValue: errorName,
            name: errorName,
        }),
        docs: typeof errorDeclaration !== "string" ? errorDeclaration.docs : undefined,
        http:
            typeof errorDeclaration !== "string" && errorDeclaration.http != null
                ? {
                      statusCode: errorDeclaration.http.statusCode,
                  }
                : undefined,
        type: convertType({
            typeDeclaration: typeof errorDeclaration === "string" ? errorDeclaration : errorDeclaration.type,
            file,
            typeResolver,
        }),
    };
}
