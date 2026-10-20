import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

/** Whether `name` exists inside `directory`, as a file or a directory. */
export async function existsIn(directory: AbsoluteFilePath, name: string): Promise<boolean> {
    return await doesPathExist(join(directory, RelativeFilePath.of(name)));
}
