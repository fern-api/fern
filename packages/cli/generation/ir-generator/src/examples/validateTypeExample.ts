import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";

import { FernFileContext } from "../FernFileContext.js";
import { ExampleResolver } from "../resolvers/ExampleResolver.js";
import { TypeResolver } from "../resolvers/TypeResolver.js";
import { ExampleViolation } from "./exampleViolation.js";
import { validateAliasExample } from "./validateAliasExample.js";
import { validateEnumExample } from "./validateEnumExample.js";
import { validateObjectExample } from "./validateObjectExample.js";
import { validateUndiscriminatedUnionExample } from "./validateUndiscriminatedUnionExample.js";
import { validateUnionExample } from "./validateUnionExample.js";

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
