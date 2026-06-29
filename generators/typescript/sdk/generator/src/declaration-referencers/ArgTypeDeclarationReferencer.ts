import { ExportedFilePath, Reference } from "@fern-typescript/commons";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";
import { TYPES_DIRECTORY_NAME } from "./TypeDeclarationReferencer.js";

/**
 * Filename (without extension) of the single source file that holds the generated GraphQL arg-type
 * registry (`GRAPHQL_ARG_TYPES`). Lives in `api/types/` alongside the `<Name>Select` interfaces.
 */
export const GRAPHQL_ARG_TYPES_FILENAME = "GraphqlArgTypes";

/** Name of the exported registry const. */
export const GRAPHQL_ARG_TYPES_EXPORTED_NAME = "GRAPHQL_ARG_TYPES";

export declare namespace ArgTypeDeclarationReferencer {
    export type Init = AbstractDeclarationReferencer.Init;
}

/**
 * Resolves references to the generated GraphQL arg-type registry const (`GRAPHQL_ARG_TYPES`). The
 * registry is a single value export consumed by `buildGraphqlQuery` at runtime to resolve nested
 * `$args` SDL types and descend the selection by GraphQL type. Mirrors
 * {@link SelectTypeDeclarationReferencer} — one root-level file in `api/types/`.
 */
export class ArgTypeDeclarationReferencer extends AbstractDeclarationReferencer<void> {
    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                {
                    nameOnDisk: TYPES_DIRECTORY_NAME,
                    exportDeclaration: { exportAll: true }
                }
            ],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: { exportAll: true }
            }
        };
    }

    public getFilename(): string {
        return `${GRAPHQL_ARG_TYPES_FILENAME}.ts`;
    }

    public getExportedName(): string {
        return GRAPHQL_ARG_TYPES_EXPORTED_NAME;
    }

    public getReferenceToArgTypes(args: DeclarationReferencer.getReferenceTo.Options<void>): Reference {
        return this.getReferenceTo(this.getExportedName(), args);
    }
}
