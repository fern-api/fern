import { RelativeFilePath } from "@fern-api/fs-utils";
import { KotlinFile as AstKotlinFile } from "@fern-api/kotlin-ast";

export interface KotlinFileInfo {
    path: RelativeFilePath;
    file: AstKotlinFile;
}

export class KotlinFile {
    constructor(public readonly path: RelativeFilePath, public readonly file: AstKotlinFile) {}

    public toString(): string {
        return this.file.toString();
    }
}
