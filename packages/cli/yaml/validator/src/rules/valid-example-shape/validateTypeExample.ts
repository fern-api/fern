import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateAliasExample } from "./validateAliasExample";
import { validateEnumExample } from "./validateEnumExample";
import { validateObjectExample } from "./validateObjectExample";
import { validateUnionExample } from "./validateUnionExample";

export function validateTypeExample({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
    example,
    workspace,
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    example: RawSchemas.ExampleTypeSchema;
    workspace: Workspace;
}): RuleViolation[] {
    return visitRawTypeDeclaration(typeDeclaration, {
        alias: (rawAlias) => {
            return validateAliasExample({
                rawAlias,
                file,
                typeResolver,
                example,
                workspace,
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
                typeName,
                rawObject,
                example,
                file,
                typeResolver,
                workspace,
            });
        },
        union: (rawUnion) => {
            return validateUnionExample({
                typeName,
                rawUnion,
                example,
                file,
                typeResolver,
                workspace,
            });
        },
    });
}
