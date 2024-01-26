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
    workspace
}: {
    typeName: string;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    example: RawSchemas.ExampleTypeValueSchema;
    workspace: FernWorkspace;
}): ExampleViolation[] {
    return visitRawTypeDeclaration(typeDeclaration, {
        alias: (rawAlias) => {
            return validateAliasExample({
                rawAlias,
                file,
                typeResolver,
                exampleResolver,
                example,
                workspace
            });
        },
        enum: (rawEnum) => {
            return validateEnumExample({
                rawEnum,
                example
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
                workspace
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
                workspace
            });
        },
        undiscriminatedUnion: (rawUnion) => {
            return validateUndiscriminatedUnionExample({
                rawUnion,
                example,
                file,
                typeResolver,
                exampleResolver,
                workspace
            });
        }
    });
}
