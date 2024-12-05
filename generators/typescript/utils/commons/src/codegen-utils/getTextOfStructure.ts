import { Project, StatementStructures, WriterFunction } from "ts-morph";

export function getTextOfStructure(
    statements: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>
): string {
    // Create an in-memory project
    const project = new Project();

    // Create a temporary source file
    const sourceFile = project.createSourceFile("temp.ts", "", { overwrite: true });

    sourceFile.addStatements(statements);
    // Format the code with default or custom options
    sourceFile.formatText();
    return sourceFile.getFullText();
}
