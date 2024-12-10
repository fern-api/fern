import { AstNode } from "./core/AstNode";
import { Comment } from "./Comment";
import { Writer } from "./core/Writer";
import { Reference } from "./Reference";
import { ModulePath } from "./core/types";
import { StarImport } from "./StarImport";
import { Class } from "./Class";
import { Method } from "./Method";
import { Field } from "./Field";
import { Type } from "./Type";

export declare namespace PythonFile {
    interface Args {
        /* The path of the Python file relative to the module */
        path: ModulePath;
        /* The list of statements in the Python file. More can be added following initialization. */
        statements?: AstNode[];
        /* Whether or not this represents the root of a Python module */
        isInitFile?: boolean;
        /* Any comments that should be at the top of the file */
        comments?: Comment[];
        /* Any explicit imports that should be included */
        imports?: StarImport[];
    }
}

export class PythonFile extends AstNode {
    public readonly path: ModulePath;
    public readonly isInitFile: boolean;
    private readonly statements: AstNode[] = [];
    private readonly comments: Comment[];

    constructor({ path, statements, isInitFile = false, comments, imports }: PythonFile.Args) {
        super();
        this.path = path;
        this.isInitFile = isInitFile;

        statements?.forEach((statement) => this.addStatement(statement));

        this.comments = comments ?? [];

        imports?.forEach((import_) => this.addReference(import_));
    }

    public addStatement(statement: AstNode): void {
        this.statements.push(statement);
        this.inheritReferences(statement);
    }

    public write(writer: Writer): void {
        const uniqueReferences = this.deduplicateReferences();

        this.updateWriterRefNameOverrides({ writer, uniqueReferences });

        this.writeComments(writer);
        this.writeImports({ writer, uniqueReferences });
        this.statements.forEach((statement, idx) => {
            statement.write(writer);
            writer.newLine();
            if (idx < this.statements.length - 1) {
                writer.newLine();
            }
        });

        writer.unsetRefNameOverrides();
    }

    /*******************************
     * Helper Methods
     *******************************/

    private updateWriterRefNameOverrides({
        writer,
        uniqueReferences
    }: {
        writer: Writer;
        uniqueReferences: Map<string, { modulePath: ModulePath; references: Reference[]; referenceNames: Set<string> }>;
    }): void {
        const reservedNames = this.getReservedNames();

        const numTimesNameUsedInFile: Record<string, number> = Array.from(reservedNames).reduce<Record<string, number>>(
            (acc, name) => {
                acc[name] = 1;
                return acc;
            },
            {}
        );

        const references: Reference[] = Array.from(uniqueReferences.values()).flatMap(({ references }) => references);
        references.forEach((reference) => {
            const name = reference.alias ?? reference.name;
            if (numTimesNameUsedInFile[name] !== undefined) {
                numTimesNameUsedInFile[name]++;
            } else {
                numTimesNameUsedInFile[name] = 1;
            }
        });

        const nameToTimesReferenced: Record<string, number> = Object.keys(numTimesNameUsedInFile).reduce<
            Record<string, number>
        >((acc, name) => {
            acc[name] = reservedNames.has(name) ? 1 : 0;
            return acc;
        }, {});

        const completeRefPathsToNameOverrides: Record<string, { name: string; isAlias: boolean }> = {};
        references.forEach((reference) => {
            const name = reference.alias ?? reference.name;

            let numTimesNameUsedInFile: number;
            const rawNumTimesNameUsedInFile = nameToTimesReferenced[name];
            if (rawNumTimesNameUsedInFile === undefined) {
                numTimesNameUsedInFile = 0;
                nameToTimesReferenced[name] = 1;
            } else {
                numTimesNameUsedInFile = rawNumTimesNameUsedInFile;
                nameToTimesReferenced[name]++;
            }

            const refIdentifier = reference.getCompletePath();

            if (numTimesNameUsedInFile > 0) {
                completeRefPathsToNameOverrides[refIdentifier] = {
                    name: `${name}_${numTimesNameUsedInFile}`,
                    isAlias: true
                };
            } else {
                completeRefPathsToNameOverrides[refIdentifier] = { name, isAlias: !!reference.alias };
            }
        });

        writer.setRefNameOverrides(completeRefPathsToNameOverrides);
    }

    private getReservedNames(): Set<string> {
        const reservedNames = new Set<string>();

        this.statements.forEach((statement) => {
            if (statement instanceof Class) {
                reservedNames.add(statement.name);
            } else if (statement instanceof Method) {
                reservedNames.add(statement.name);
            } else if (statement instanceof Field) {
                reservedNames.add(statement.name);
            }
        });

        return reservedNames;
    }

    private deduplicateReferences() {
        // Deduplicate references by their fully qualified paths
        const uniqueReferences = new Map<
            string,
            { modulePath: ModulePath; references: Reference[]; referenceNames: Set<string> }
        >();
        for (const reference of this.references) {
            const referenceName = reference.name;
            const fullyQualifiedPath = reference.getFullyQualifiedModulePath();
            const existingRefs = uniqueReferences.get(fullyQualifiedPath);

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

        return uniqueReferences;
    }

    private writeComments(writer: Writer): void {
        this.comments.forEach((comment) => {
            comment.write(writer);
        });

        if (this.comments.length > 0) {
            writer.newLine();
        }
    }

    private getImportName({ writer, reference }: { writer: Writer; reference: Reference }): string {
        const nameOverride = writer.getRefNameOverride(reference);

        const name = reference.name;
        const alias = nameOverride.isAlias ? nameOverride.name : undefined;

        return `${name}${alias ? ` as ${alias}` : ""}`;
    }

    private writeImports({
        writer,
        uniqueReferences
    }: {
        writer: Writer;
        uniqueReferences: Map<string, { modulePath: ModulePath; references: Reference[] }>;
    }): void {
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
                    `from ${relativePath} import ${references
                        .map((reference) => this.getImportName({ writer, reference }))
                        .join(", ")}`
                );
            } else {
                // Use fully qualified path
                writer.write(
                    `from ${fullyQualifiedPath} import ${references
                        .map((reference) => this.getImportName({ writer, reference }))
                        .join(", ")}`
                );
            }

            writer.newLine();
        }

        if (Object.keys(uniqueReferences).length > 0) {
            writer.newLine();
        }
    }
}
