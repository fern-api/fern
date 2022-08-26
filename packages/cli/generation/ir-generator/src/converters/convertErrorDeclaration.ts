import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { Type } from "@fern-fern/ir-model/types";
import { generateWireStringWithAllCasings } from "../utils/generateCasings";
import { createTypeReferenceParser } from "../utils/parseInlineType";
import { convertType } from "./type-declarations/convertTypeDeclaration";

export function convertErrorDeclaration({
    errorName,
    fernFilepath,
    errorDeclaration,
    imports,
}: {
    errorName: string;
    fernFilepath: FernFilepath;
    errorDeclaration: RawSchemas.ErrorDeclarationSchema | string;
    imports: Record<string, RelativeFilePath>;
}): ErrorDeclaration {
    const parseTypeReference = createTypeReferenceParser({ fernFilepath, imports });

    return {
        name: {
            name: errorName,
            fernFilepath,
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
        type:
            typeof errorDeclaration === "string"
                ? Type.alias({
                      aliasOf: parseTypeReference(errorDeclaration),
                  })
                : convertType({ typeDeclaration: errorDeclaration.type, fernFilepath, imports }),
    };
}
