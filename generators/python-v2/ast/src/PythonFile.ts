import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";
import { ModulePath } from "./core/types";

export declare namespace PythonFile {
    interface Args {
        /* The path of the Python file relative to the module */
        path: ModulePath;
        /* The list of statements in the Python file. More can be added following initialization. */
        statements?: AstNode[];
        /* Whether or not this represents the root of a Python module */
        isInitFile?: boolean;
    }
}

export class PythonFile extends AstNode {
    public readonly path: ModulePath;
    public readonly isInitFile: boolean;
    private readonly statements: AstNode[] = [];

    constructor({ path, statements, isInitFile = false }: PythonFile.Args) {
        super();
        this.path = path;
        this.isInitFile = isInitFile;

        statements?.forEach((statement) => this.addStatement(statement));
    }

    public addStatement(statement: AstNode): void {
        this.statements.push(statement);
        this.inheritReferences(statement);
    }

    public write(writer: Writer): void {
        this.writeImports(writer);
        this.statements.forEach((statement, idx) => {
            statement.write(writer);
            writer.newLine();
            if (idx < this.statements.length - 1) {
                writer.newLine();
            }
        });
    }

    /*******************************
     * Helper Methods
     *******************************/

    private getImportName(reference: Reference): string {
        const name = reference.name;
        const alias = reference.alias;
        return `${name}${alias ? ` as ${alias}` : ""}`;
    }

    private writeImports(writer: Writer): void {
        // Deduplicate references by their fully qualified paths
        const uniqueReferences = new Map<
            string,
            { modulePath: ModulePath; references: Reference[]; referenceNames: Set<string> }
        >();
        for (const reference of this.references) {
            const fullyQualifiedPath = reference.getFullyQualifiedModulePath();
            const existingRefs = uniqueReferences.get(fullyQualifiedPath);
            const referenceName = reference.name;
            if (existingRefs) {
                if (!existingRefs.referenceNames.has(referenceName)) {
                    existingRefs.references.push(reference);
                    existingRefs.referenceNames.add(referenceName);
                }
            } else {
                uniqueReferences.set(fullyQualifiedPath, {
                    modulePath: reference.modulePath,
                    references: [reference],
                    referenceNames: new Set([referenceName])
                });
            }
        }

        for (const [fullyQualifiedPath, { modulePath, references }] of uniqueReferences) {
            const refModulePath = modulePath;
            if (refModulePath[0] === this.path[0]) {
                // Relativize the import
                // Calculate the common prefix length
                let commonPrefixLength = 0;
                while (
                    commonPrefixLength < this.path.length &&
                    commonPrefixLength < refModulePath.length &&
                    this.path[commonPrefixLength] === refModulePath[commonPrefixLength]
                ) {
                    commonPrefixLength++;
                }

                // Calculate the number of levels to go up
                let levelsUp = this.path.length - commonPrefixLength;

                // If this is an __init__.py file, then we must go one more level up.
                if (this.isInitFile) {
                    levelsUp++;
                }

                // Build the relative import path
                let relativePath = levelsUp > 0 ? ".".repeat(levelsUp) : ".";
                relativePath += refModulePath.slice(commonPrefixLength).join(".");

                // Write the relative import statement
                writer.write(
                    `from ${relativePath} import ${references.map((ref) => this.getImportName(ref)).join(", ")}`
                );
            } else {
                // Use fully qualified path
                writer.write(
                    `from ${fullyQualifiedPath} import ${references.map((ref) => this.getImportName(ref)).join(", ")}`
                );
            }

            writer.newLine();
        }

        if (Object.keys(uniqueReferences).length > 0) {
            writer.newLine();
        }
    }
}
