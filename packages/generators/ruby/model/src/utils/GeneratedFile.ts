import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";

export class GeneratedFile {
    public filename: string;
    public directory: RelativeFilePath;
    public fileContents: string;

    constructor(filename: string, directory: RelativeFilePath, fileContents: string) {
        this.filename = filename;
        this.directory = directory;
        this.fileContents = fileContents;
    }

    public async write(directoryPrefix: AbsoluteFilePath, contents: string): Promise<void> {
        const outputDirectory = join(directoryPrefix, this.directory);
        await mkdir(outputDirectory, { recursive: true });
        await writeFile(`${outputDirectory}/${this.filename}`, contents);
    }
}