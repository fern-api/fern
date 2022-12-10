import { assertNever } from "@fern-api/core-utils";
import { RawPrimitiveType, RawSchemas } from "@fern-api/yaml-schema";
import { NameAndWireValue } from "@fern-fern/ir-model/commons";
import { ErrorDeclaration, ErrorDeclarationDiscriminantValue } from "@fern-fern/ir-model/errors";
import { FernFileContext } from "../FernFileContext";
import { TypeResolver } from "../resolvers/TypeResolver";
import { convertType } from "./type-declarations/convertTypeDeclaration";

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

    const discriminantValue = file.casingsGenerator.generateNameAndWireValue({
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
        discriminantValueV2: discriminantValue,
        discriminantValueV3: getErrorDiscriminantValueV3(errorDiscriminationSchema, discriminantValue),
        discriminantValueV4: discriminantValue,
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

function getErrorDiscriminantValueV3(
    errorDiscrimination: RawSchemas.ErrorDiscriminationSchema,
    discriminantValueForProperty: NameAndWireValue
): ErrorDeclarationDiscriminantValue {
    const strategy = errorDiscrimination.strategy;
    switch (strategy) {
        case "property":
            return ErrorDeclarationDiscriminantValue.property(discriminantValueForProperty);
        case "status-code":
            return ErrorDeclarationDiscriminantValue.statusCode();
        default:
            assertNever(strategy);
    }
}
