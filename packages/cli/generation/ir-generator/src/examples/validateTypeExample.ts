import { FernWorkspace } from "@fern-api/workspace-loader";
import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
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
    breadcrumbs
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    example: RawSchemas.ExampleTypeValueSchema;
    workspace: FernWorkspace;
    breadcrumbs: string[];
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
                breadcrumbs
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
                breadcrumbs
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
                breadcrumbs
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
                breadcrumbs
            });
        }
    });
}
