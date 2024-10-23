import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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
        const filepath = `${join(directoryPrefix, this.directory)}/${this.filename}`;
        await mkdir(path.dirname(filepath), { recursive: true });
        await writeFile(filepath, this.fileContents);
    }
}
