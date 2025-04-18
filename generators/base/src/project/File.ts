import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

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
        const content = typeof this.fileContents === "string" ? this.fileContents : new Uint8Array(this.fileContents);
        await writeFile(filepath, content);
    }
}
