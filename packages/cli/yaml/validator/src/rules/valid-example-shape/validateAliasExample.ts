import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export function validateAliasExample({
    rawAlias,
    example,
    file,
    typeResolver,
}: {
    rawAlias: string | RawSchemas.AliasSchema;
    example: RawSchemas.TypeExampleSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): RuleViolation[] {
    return validateTypeReferenceExample({
        rawTypeReference: typeof rawAlias === "string" ? rawAlias : rawAlias.type,
        example,
        file,
        typeResolver,
    });
}
