import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";

export class File {
    public filename: string;
    public directory: RelativeFilePath;
    public fileContents: string | Buffer;

    constructor(filename: string, directory: RelativeFilePath, fileContents: string | Buffer) {
        this.filename = filename;
        this.directory = directory;
        this.fileContents = fileContents;
    }

    public async write(directoryPrefix: AbsoluteFilePath): Promise<void> {
        const outputDirectory = join(directoryPrefix, this.directory);
        await mkdir(outputDirectory, { recursive: true });
        await writeFile(`${outputDirectory}/${this.filename}`, this.fileContents);
    }
}
