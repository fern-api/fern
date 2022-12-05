import { assertNever } from "@fern-api/core-utils";
import { RawPrimitiveType, RawSchemas } from "@fern-api/yaml-schema";
import { NameAndWireValue } from "@fern-fern/ir-model/commons";
import { ErrorDeclaration, ErrorDeclarationDiscriminantValue } from "@fern-fern/ir-model/errors";
import { FernFileContext } from "../FernFileContext";
import { TypeResolver } from "../resolvers/TypeResolver";
import { convertType } from "./type-declarations/convertTypeDeclaration";

function getErrorDiscriminantValueV3(
    errorDiscrimination: RawSchemas.ErrorDiscriminationSchema,
    discriminantValueV2: NameAndWireValue
): ErrorDeclarationDiscriminantValue {
    const strategy = errorDiscrimination.strategy;
    switch (strategy) {
        case "property":
            return ErrorDeclarationDiscriminantValue.property(discriminantValueV2);
        case "status-code":
            return ErrorDeclarationDiscriminantValue.statusCode();
        default:
            assertNever(strategy);
    }
}

export function convertErrorDeclaration({
    errorName,
    errorDeclaration,
    file,
    typeResolver,
    errorDiscriminationSchema,
}: {
    errorName: string;
    errorDeclaration: RawSchemas.ErrorDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    errorDiscriminationSchema: RawSchemas.ErrorDiscriminationSchema;
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
    const discriminantValueV3 = getErrorDiscriminantValueV3(errorDiscriminationSchema, discriminantValueV2);
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
        discriminantValueV3,
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
