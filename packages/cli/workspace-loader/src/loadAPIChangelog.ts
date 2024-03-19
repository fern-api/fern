import { CHANGELOG_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { listFiles } from "./listFiles";
import { APIChangelog } from "./types/Workspace";

export async function loadAPIChangelog({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<Promise<APIChangelog | undefined>> {
    const absolutePathToChangelogDirectory = join(absolutePathToWorkspace, RelativeFilePath.of(CHANGELOG_DIRECTORY));
    const changelogDirectoryExists = await doesPathExist(absolutePathToChangelogDirectory);
    if (!changelogDirectoryExists) {
        return undefined;
    }

    const mdFiles = await listFiles(absolutePathToChangelogDirectory, "{md,mdx}");
    return {
        files: await Promise.all(
            mdFiles.map((file) => {
                return {
                    absoluteFilepath: join(absolutePathToChangelogDirectory, file.filepath),
                    contents: file.fileContents
                };
            })
        )
    };
}
