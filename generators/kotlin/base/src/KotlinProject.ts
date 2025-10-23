import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { KotlinFile } from "./KotlinFile";

export class KotlinProject {
    private files: KotlinFile[] = [];

    constructor(private readonly outputDirectory: AbsoluteFilePath) {}

    public addFile(file: KotlinFile): void {
        this.files.push(file);
    }

    public addFiles(...files: KotlinFile[]): void {
        this.files.push(...files);
    }

    public async persist(): Promise<void> {
        for (const file of this.files) {
            const absolutePath = join(this.outputDirectory, file.path);
            const directory = path.dirname(absolutePath);

            await mkdir(directory, { recursive: true });
            await writeFile(absolutePath, file.toString());
        }
    }

    public getFiles(): readonly KotlinFile[] {
        return this.files;
    }
}
