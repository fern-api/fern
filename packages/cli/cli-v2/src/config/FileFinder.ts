import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { findUp } from "find-up";

export namespace FileFinder {
    export interface Options {
        /**
         * The directory to start searching from (e.g. the current working directory).
         */
        from: AbsoluteFilePath;
    }
}

export class FileFinder {
    private readonly from: string;

    constructor(options: FileFinder.Options) {
        this.from = options.from;
    }

    /**
     * Searches for a file by ascending from the starting directory until
     * the file is found or the filesystem root is reached.
     *
     * Throws an error if the file is not found.
     *
     * @param filename - The name of the file to find (e.g., "fern.yml")
     * @returns The absolute path to the file if found, undefined otherwise.
     * @throws Error if the file is not found.
     */
    public async findOrThrow(filename: string): Promise<AbsoluteFilePath> {
        const filepath = await this.find(filename);
        if (filepath == null) {
            throw new Error(`File ${filename} not found in any parent directory from ${this.from}`);
        }
        return filepath;
    }

    /**
     * Searches for a file by ascending from the starting directory until
     * the file is found or the filesystem root is reached.
     *
     * @param filename - The name of the file to find (e.g., "fern.yml")
     * @returns The absolute path to the file if found, undefined otherwise.
     */
    public async find(filename: string): Promise<AbsoluteFilePath | undefined> {
        const filepath = await findUp(filename, { cwd: this.from, type: "file" });
        if (filepath == null) {
            return undefined;
        }
        const absoluteFilepath = AbsoluteFilePath.of(filepath);
        if (await doesPathExist(absoluteFilepath)) {
            return absoluteFilepath;
        }
        return undefined;
    }
}
