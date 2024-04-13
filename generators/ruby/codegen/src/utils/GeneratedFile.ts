import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";

export class GeneratedFile {
    public filename: string;
    public directory: RelativeFilePath | AbsoluteFilePath;
    public fileContents: string;

    constructor(filename: string, directory: RelativeFilePath | AbsoluteFilePath, fileContents: string) {
        this.filename = filename;
        this.directory = directory;
        this.fileContents = fileContents;
    }

    public async write(directoryPrefix: AbsoluteFilePath): Promise<void> {
        const outputDirectory =
            "__AbsoluteFilePath" in this.directory ? this.directory : join(directoryPrefix, this.directory);
        await mkdir(outputDirectory, { recursive: true });
        await writeFile(`${outputDirectory}/${this.filename}`, this.fileContents);
    }
}
