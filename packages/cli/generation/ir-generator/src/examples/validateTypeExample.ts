import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";

import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { ExampleViolation } from "./exampleViolation";
import { validateAliasExample } from "./validateAliasExample";
import { validateEnumExample } from "./validateEnumExample";
import { validateObjectExample } from "./validateObjectExample";
import { validateUndiscriminatedUnionExample } from "./validateUndiscriminatedUnionExample";
import { validateUnionExample } from "./validateUnionExample";

export function validateTypeExample({
    typeName,
    typeDeclaration,
    file,
    typeResolver,
    exampleResolver,
    example,
    workspace,
    breadcrumbs,
    depth
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    example: RawSchemas.ExampleTypeValueSchema;
    workspace: FernWorkspace;
    breadcrumbs: string[];
    depth: number;
}): ExampleViolation[] {
    return visitRawTypeDeclaration(typeDeclaration, {
        alias: (rawAlias) => {
            return validateAliasExample({
                rawAlias,
                file,
                typeResolver,
                exampleResolver,
                example,
                workspace,
                breadcrumbs,
                depth
            });
        },
        enum: (rawEnum) => {
            return validateEnumExample({
                rawEnum,
                example,
                breadcrumbs
            });
        },
        object: (rawObject) => {
            return validateObjectExample({
                typeName,
                typeNameForBreadcrumb: typeName,
                rawObject,
                example,
                file,
                typeResolver,
                exampleResolver,
                workspace,
                breadcrumbs,
                depth
            });
        },
        discriminatedUnion: (rawUnion) => {
            return validateUnionExample({
                typeName,
                rawUnion,
                example,
                file,
                typeResolver,
                exampleResolver,
                workspace,
                breadcrumbs,
                depth
            });
        },
        undiscriminatedUnion: (rawUnion) => {
            return validateUndiscriminatedUnionExample({
                rawUnion,
                example,
                file,
                typeResolver,
                exampleResolver,
                workspace,
                breadcrumbs,
                depth
            });
        }
    });
}
