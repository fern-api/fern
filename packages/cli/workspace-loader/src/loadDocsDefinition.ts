import { loadDocsConfiguration } from "@fern-api/docs-configuration";
import { AbsoluteFilePath, doesPathExist, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { listFiles } from "./listFiles";
import { DocsDefinition } from "./types/Workspace";

export async function loadDocsDefinition({
    absolutePathToDocsDefinition,
    context,
}: {
    absolutePathToDocsDefinition: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsDefinition | undefined> {
    if (!(await doesPathExist(absolutePathToDocsDefinition))) {
        return undefined;
    }

    return {
        absoluteFilepath: absolutePathToDocsDefinition,
        config: await loadDocsConfiguration({ absolutePathToDocsDefinition, context }),
        pages: (await listFiles(absolutePathToDocsDefinition, "md")).reduce<Record<RelativeFilePath, string>>(
            (pages, file) => ({
                ...pages,
                [file.filepath]: file.fileContents,
            }),
            {}
        ),
    };
}
