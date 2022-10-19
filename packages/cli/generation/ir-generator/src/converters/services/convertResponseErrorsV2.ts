import { RawPrimitiveType, RawSchemas } from "@fern-api/yaml-schema";
import { ResponseErrorShape, ResponseErrorsV2, ResponseErrorV2 } from "@fern-fern/ir-model/services/commons";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { parseTypeName } from "../../utils/parseTypeName";

const ERROR_DISCRIMINANT = "errorName";
const ERROR_CONTENT_PROPERTY_NAME = "content";

export function convertResponseErrorsV2({
    errors,
    file,
    errorResolver,
}: {
    errors: RawSchemas.ResponseErrorsSchema | undefined;
    file: FernFileContext;
    errorResolver: ErrorResolver;
}): ResponseErrorsV2 {
    const discriminant = file.casingsGenerator.generateWireCasings({
        wireValue: ERROR_DISCRIMINANT,
        name: ERROR_DISCRIMINANT,
    });

    if (errors == null || errors.length === 0) {
        return {
            discriminant,
            types: [],
        };
    }

    return {
        discriminant,
        types: Object.values(errors).map((errorReference): ResponseErrorV2 => {
            const referenceToError = typeof errorReference === "string" ? errorReference : errorReference.error;

            const declaration = errorResolver.getDeclaration(referenceToError, file);
            if (declaration == null) {
                throw new Error("Cannot locate declaration for error: " + referenceToError);
            }
            const rawErrorType = typeof declaration === "string" ? declaration : declaration.type;

            const parsedErrorName = parseTypeName({ typeName: referenceToError, file });
            const discriminantValue = parsedErrorName.name;

            return {
                docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                discriminantValue: file.casingsGenerator.generateWireCasings({
                    wireValue: discriminantValue,
                    name: discriminantValue,
                }),
                shape:
                    rawErrorType != null && rawErrorType !== RawPrimitiveType.void
                        ? ResponseErrorShape.singleProperty({
                              name: file.casingsGenerator.generateWireCasings({
                                  wireValue: ERROR_CONTENT_PROPERTY_NAME,
                                  name: ERROR_CONTENT_PROPERTY_NAME,
                              }),
                              error: parsedErrorName,
                          })
                        : ResponseErrorShape.noProperties(),
            };
        }),
    };
}
