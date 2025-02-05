import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

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
        const outputDirectory = path.isAbsolute(this.directory)
            ? this.directory
            : // Reinforce that this is a relative file path since we just checked that is wasn't absolute
              join(directoryPrefix, RelativeFilePath.of(this.directory));
        await mkdir(outputDirectory, { recursive: true });
        await writeFile(`${outputDirectory}/${this.filename}`, this.fileContents);
    }
}
