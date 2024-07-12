/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { AstNode } from "./AstNode";

export class GeneratedFile {
    public name: string;
    public extension: string;
    public outputDirectory: string;
    public contents: AstNode;

    get filename(): string {
        return `${this.name}.${this.extension}`;
    }

    constructor(fileName: string, fileExtension: string, outputDirectory: string, contents: AstNode) {
        this.name = fileName;
        this.extension = fileExtension;
        this.outputDirectory = outputDirectory;
        this.contents = contents;
    }

    public async generate(): Promise<string> {
        await mkdir(this.outputDirectory, { recursive: true });
        const outputFile = `${this.outputDirectory}/${this.filename}`;
        await writeFile(outputFile, this.contents.toString());
        return outputFile;
    }

    public async logFile(): Promise<void> {
        try {
            const outputFile = join(process.cwd(), this.outputDirectory, this.filename);
            const fileContents = await readFile(outputFile, { encoding: "utf8" });
            console.log(`==${outputFile}==`);
            console.log(fileContents);
            console.log("===FILE END===");
        } catch (error) {
            console.error(`Error reading file: ${error}`);
        }
    }
}
