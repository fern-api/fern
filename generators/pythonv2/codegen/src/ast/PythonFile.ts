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
    private readonly statements: (Class | Method | CodeBlock)[] = [];

    constructor({ moduleName, path, name }: PythonFile.Args) {
        super();
        this.moduleName = moduleName;
        this.path = path;
        this.name = name;
    }

    public addStatement(statement: Class | Method | CodeBlock): void {
        this.statements.push(statement);
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

    private writeImports(writer: Writer): void {
        const references = writer.getReferences();

        // Deduplicate references by their fully qualified paths
        const uniqueReferences = new Map<string, Reference>();
        references.forEach((reference) => {
            const fullyQualifiedPath = reference.getFullyQualifiedModulePath();
            if (!uniqueReferences.has(fullyQualifiedPath)) {
                uniqueReferences.set(fullyQualifiedPath, reference);
            }
        });

        // Use the deduplicated references
        const deduplicatedReferences = Array.from(uniqueReferences.values());

        deduplicatedReferences.forEach((reference) => {
            const refModulePath = reference.getModulePath();
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
                writer.write(`from ${relativePath} import ${reference.getName()}`);
            } else {
                // Use fully qualified path
                writer.write(`from ${reference.getFullyQualifiedModulePath()} import ${reference.getName()}`);
            }

            if (reference.getAlias()) {
                writer.write(` as ${reference.getAlias()}`);
            }

            writer.newLine();
        });

        if (deduplicatedReferences.length > 0) {
            writer.newLine();
        }
    }
}
