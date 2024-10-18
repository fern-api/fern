import { AstNode } from "./core/AstNode";
import { Writer } from "./core/Writer";
import { Class } from "./Class";
import { Method } from "./Method";
import { CodeBlock } from "./CodeBlock";
import { Reference } from "./Reference";

export declare namespace PythonFile {
    interface Args {
        /* The name of the Python module that this file belongs to*/
        moduleName: string;
        /* The path of the Python file relative to the module */
        path: string[];
        /* The name of the Python file */
        name: string;
    }
}

export class PythonFile extends AstNode {
    public readonly moduleName: string;
    public readonly path: string[];
    public readonly name: string;
    private readonly statements: AstNode[] = [];

    constructor({ moduleName, path, name }: PythonFile.Args) {
        super();
        this.moduleName = moduleName;
        this.path = path;
        this.name = name;
    }

    public addStatement(statement: AstNode): void {
        this.statements.push(statement);

        statement.getReferences().forEach((reference) => {
            this.addReference(reference);
        });
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
        const name = reference.getName();
        const alias = reference.getAlias();
        return `${name}${alias ? ` as ${alias}` : ""}`;
    }

    private writeImports(writer: Writer): void {
        const references = this.getReferences();

        // Deduplicate references by their fully qualified paths
        const uniqueReferences = new Map<string, { modulePath: string[]; references: Reference[] }>();
        for (const reference of references) {
            const fullyQualifiedPath = reference.getFullyQualifiedModulePath();
            const existingRefs = uniqueReferences.get(fullyQualifiedPath);
            if (existingRefs) {
                if (!existingRefs.references.includes(reference)) {
                    existingRefs.references.push(reference);
                }
            } else {
                uniqueReferences.set(fullyQualifiedPath, {
                    modulePath: reference.getModulePath(),
                    references: [reference]
                });
            }
        }

        for (const [fullyQualifiedPath, { modulePath, references }] of uniqueReferences) {
            const refModulePath = modulePath;
            if (refModulePath[0] === this.moduleName) {
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
                const levelsUp = this.path.length - commonPrefixLength;

                // Build the relative import path
                let relativePath = ".".repeat(levelsUp);
                if (levelsUp > 0) {
                    relativePath += ".";
                }
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
