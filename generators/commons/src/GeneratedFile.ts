/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { AstNode } from "./AstNode";

export class GeneratedFile {

    public name: string;
    public extension: string;
    public directory: string;
    public contents: AstNode;

    get filename(): string { 
        return `${this.name}.${this.extension}`; 
    }

    constructor(fileName: string, fileExtension: string, directory: string, contents: AstNode) {
        this.name = fileName;
        this.extension = fileExtension;
        this.directory = directory;
        this.contents = contents;
    }

    public async generate(): Promise<string> {
        await mkdir(this.directory, { recursive: true });
        const outputFile = `${this.directory}/${this.filename}`;
        await writeFile(outputFile, this.contents.toString());
        return outputFile;
    }

    public async seeFile(): Promise<void> {
        try {
            const outputFile = join(process.cwd(), this.directory, this.filename);
            const fileContents = await readFile(outputFile, { encoding: "utf8" });
            console.log(`Contents of ${outputFile}:`);
            console.log(fileContents);
        } catch (error) {
            console.error(`Error reading file: ${error}`);
        }
    }

}
