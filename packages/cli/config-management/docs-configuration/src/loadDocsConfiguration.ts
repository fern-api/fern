import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { convertDocsConfiguration } from "./convertDocsConfiguration";
import { DocsConfiguration } from "./DocsConfiguration";
import { loadRawDocsConfiguration } from "./loadRawDocsConfiguration";

export async function loadDocsConfiguration({
    absolutePathToDocsDefinition,
    context,
}: {
    absolutePathToDocsDefinition: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsConfiguration> {
    const absolutePathOfConfiguration = join(
        absolutePathToDocsDefinition,
        RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
    );
    const rawDocsConfiguration = await loadRawDocsConfiguration({
        absolutePathOfConfiguration,
        context,
    });
    return convertDocsConfiguration({
        rawDocsConfiguration,
        absolutePathOfConfiguration,
        context,
    });
}
