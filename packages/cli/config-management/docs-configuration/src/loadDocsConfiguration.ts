import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME, DOCS_DIRECTORY } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { convertDocsConfiguration } from "./convertDocsConfiguration";
import { DocsConfiguration } from "./DocsConfiguration";
import { loadRawDocsConfiguration } from "./loadRawDocsConfiguration";

export async function loadDocsConfiguration({
    absolutePathToWorkspace,
    context,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsConfiguration | undefined> {
    const rawDocsConfiguration = await loadRawDocsConfiguration({
        absolutePathToWorkspace,
        context,
    });
    if (rawDocsConfiguration == null) {
        return undefined;
    }
    return convertDocsConfiguration({
        rawDocsConfiguration,
        absolutePathOfConfiguration: join(
            absolutePathToWorkspace,
            RelativeFilePath.of(DOCS_DIRECTORY),
            RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
        ),
        context,
    });
}
