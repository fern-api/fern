import { RawPrimitiveType, RawSchemas } from "@fern-api/yaml-schema";
import { ErrorDeclaration, ErrorDeclarationDiscriminant } from "@fern-fern/ir-model/errors";
import { FernFileContext } from "../FernFileContext";
import { TypeResolver } from "../resolvers/TypeResolver";
import { convertType } from "./type-declarations/convertTypeDeclaration";

export function convertErrorDeclaration({
    errorName,
    errorDeclaration,
    file,
    typeResolver,
    isStatusCodeDiscriminated,
}: {
    errorName: string;
    errorDeclaration: RawSchemas.ErrorDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    isStatusCodeDiscriminated: boolean;
}): ErrorDeclaration {
    const rawType = errorDeclaration.type;
    const convertedType = rawType != null ? file.parseTypeReference(rawType) : undefined;
    const convertedTypeDeclaration =
        rawType != null
            ? convertType({
                  typeDeclaration: rawType,
                  file,
                  typeResolver,
              })
            : undefined;
    const discriminantValueV2 = file.casingsGenerator.generateNameAndWireValue({
        wireValue: errorName,
        name: errorName,
    });
    return {
        name: {
            name: errorName,
            nameV2: file.casingsGenerator.generateNameCasingsV1(errorName),
            nameV3: file.casingsGenerator.generateName(errorName),
            fernFilepath: file.fernFilepath,
            fernFilepathV2: file.fernFilepathV2,
        },
        discriminantValue: file.casingsGenerator.generateWireCasingsV1({
            wireValue: errorName,
            name: errorName,
        }),
        discriminantValueV2,
        discriminantValueV3: isStatusCodeDiscriminated
            ? ErrorDeclarationDiscriminant.statusCode()
            : ErrorDeclarationDiscriminant.property(discriminantValueV2),
        docs: typeof errorDeclaration !== "string" ? errorDeclaration.docs : undefined,
        http: {
            statusCode: errorDeclaration["status-code"],
        },
        statusCode: errorDeclaration["status-code"],
        type:
            convertedTypeDeclaration ??
            convertType({
                typeDeclaration:
                    typeof errorDeclaration === "string"
                        ? errorDeclaration
                        : errorDeclaration.type ?? RawPrimitiveType.void,
                file,
                typeResolver,
            }),
        typeV2: convertedTypeDeclaration,
        typeV3: convertedType,
    };
}
