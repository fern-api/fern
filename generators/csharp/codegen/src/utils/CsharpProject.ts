import { File } from "./File";

/**
 * In memory representation of a C# project.
 */
export class CsharpProject {
    private files: File[] = [];

    public constructor(private readonly name: string) {}

    public addFile(file: File): void {
        this.files.push(file);
    }
}
