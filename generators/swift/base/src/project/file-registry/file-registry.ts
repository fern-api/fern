import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";
import { SwiftFile } from "../SwiftFile";

export class FileRegistry {
    private readonly filesByName: Map<string, SwiftFile> = new Map();

    public getAll(): SwiftFile[] {
        return Array.from(this.filesByName.values());
    }

    public add({
        nameCandidateWithoutExtension,
        directory,
        contents,
        includeFoundationImport
    }: {
        nameCandidateWithoutExtension: string;
        directory: RelativeFilePath;
        contents: string | swift.FileComponent[];
        includeFoundationImport?: true;
    }): SwiftFile {
        let filenameWithoutExt = nameCandidateWithoutExtension;
        while (this.filesByName.has(filenameWithoutExt)) {
            filenameWithoutExt += "_";
        }
        const filename = filenameWithoutExt + ".swift";
        const contentsArray = typeof contents === "string" ? [contents] : contents;
        const file = includeFoundationImport
            ? SwiftFile.createWithFoundation({
                  filename,
                  directory,
                  contents: contentsArray
              })
            : SwiftFile.create({
                  filename,
                  directory,
                  contents: contentsArray
              });
        this.filesByName.set(filenameWithoutExt, file);
        return file;
    }
}
