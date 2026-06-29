import { FernIr } from "@fern-fern/ir-sdk";
import { ExportedFilePath, Reference } from "@fern-typescript/commons";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer.js";
import { DeclarationReferencer } from "./DeclarationReferencer.js";
import { TYPES_DIRECTORY_NAME } from "./TypeDeclarationReferencer.js";

/**
 * Filename (without extension) of the single source file that holds every generated
 * per-type `<Name>Select` interface. All Select interfaces live in one file so they can
 * reference each other (and recurse) without cross-file import management.
 */
export const GRAPHQL_SELECT_TYPES_FILENAME = "GraphqlSelectTypes";

export declare namespace SelectTypeDeclarationReferencer {
    export type Init = AbstractDeclarationReferencer.Init;
}

/**
 * Resolves references to the generated GraphQL field-selection types (`<Name>Select`). Every
 * Select interface is emitted into a single root-level file (`api/types/GraphqlSelectTypes.ts`),
 * so all references resolve to that one file. The naming mirrors `TypeDeclarationReferencer`
 * (PascalCase of the type name) with a `Select` suffix.
 */
export class SelectTypeDeclarationReferencer extends AbstractDeclarationReferencer<FernIr.DeclaredTypeName> {
    public getExportedFilepath(_typeName?: FernIr.DeclaredTypeName): ExportedFilePath {
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

    public getFilename(_typeName?: FernIr.DeclaredTypeName): string {
        return `${GRAPHQL_SELECT_TYPES_FILENAME}.ts`;
    }

    /**
     * Returns the `<Name>Select` exported name for a type. Mirrors how
     * `TypeDeclarationReferencer.getExportedName` PascalCases the type name.
     */
    public getExportedName(typeName: FernIr.DeclaredTypeName): string {
        return `${this.case.pascalSafe(typeName.name)}Select`;
    }

    /**
     * Returns the `<Name>DefaultSelection` exported name for a type — the `as const` default selection
     * constant emitted alongside each `<Name>Select` interface (the safe-scalar default used when a
     * caller omits the GraphQL `selection` argument).
     */
    public getDefaultSelectionExportedName(typeName: FernIr.DeclaredTypeName): string {
        return `${this.case.pascalSafe(typeName.name)}DefaultSelection`;
    }

    public getReferenceToType(args: DeclarationReferencer.getReferenceTo.Options<FernIr.DeclaredTypeName>): Reference {
        return this.getReferenceTo(this.getExportedName(args.name), args);
    }

    /**
     * Reference to the `<Name>DefaultSelection` const, resolved from the same single Select file as
     * {@link getReferenceToType}.
     */
    public getReferenceToDefaultSelection(
        args: DeclarationReferencer.getReferenceTo.Options<FernIr.DeclaredTypeName>
    ): Reference {
        return this.getReferenceTo(this.getDefaultSelectionExportedName(args.name), args);
    }
}
