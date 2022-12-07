import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateAliasExample } from "./validateAliasExample";
import { validateEnumExample } from "./validateEnumExample";
import { validateObjectExample } from "./validateObjectExample";
import { validateUnionExample } from "./validateUnionExample";

export function validateTypeExample({
    typeDeclaration,
    file,
    typeResolver,
    example,
}: {
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    example: RawSchemas.TypeExampleSchema;
}): RuleViolation[] {
    return visitRawTypeDeclaration(typeDeclaration, {
        alias: (rawAlias) => {
            return validateAliasExample({
                rawAlias,
                file,
                typeResolver,
                example,
            });
        },
        enum: (rawEnum) => {
            return validateEnumExample({
                rawEnum,
                example,
            });
        },
        object: (rawObject) => {
            return validateObjectExample({
                rawObject,
                example,
            });
        },
        union: () => {
            return validateUnionExample();
        },
    });
}
