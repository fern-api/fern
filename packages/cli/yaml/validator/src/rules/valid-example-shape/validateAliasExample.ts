import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export function validateAliasExample({
    rawAlias,
    example,
    file,
    typeResolver,
    workspace,
}: {
    rawAlias: string | RawSchemas.AliasSchema;
    example: RawSchemas.ExampleTypeSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    workspace: Workspace;
}): RuleViolation[] {
    return validateTypeReferenceExample({
        rawTypeReference: typeof rawAlias === "string" ? rawAlias : rawAlias.type,
        example,
        file,
        typeResolver,
        workspace,
    });
}
