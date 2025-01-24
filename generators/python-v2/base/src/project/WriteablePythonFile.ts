import { File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { python } from "@fern-api/python-ast";

export declare namespace WriteablePythonFile {
    interface Args {
        filename: string;
        /* Directory of the filepath */
        directory: RelativeFilePath;

        contents: python.PythonFile;
    }
}

export class WriteablePythonFile extends File {
    constructor({ filename, directory, contents }: WriteablePythonFile.Args) {
        super(`${filename}.py`, directory, contents.toString());
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }
}
