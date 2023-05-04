import { addPrefixToString } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { DocsConfiguration as RawDocsConfiguration } from "@fern-fern/docs-config/api";
import { DocsConfiguration as RawDocsConfigurationSerializer } from "@fern-fern/docs-config/serialization";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function loadRawDocsConfiguration({
    absolutePathToWorkspace,
    context,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<RawDocsConfiguration | undefined> {
    const absolutePathToDocsConfiguration = join(
        absolutePathToWorkspace,
        RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
    );

    if (!(await doesPathExist(absolutePathToDocsConfiguration))) {
        return undefined;
    }

    const contentsStr = await readFile(absolutePathToDocsConfiguration);
    const contentsJson = yaml.load(contentsStr.toString());
    return await validateSchema({
        value: contentsJson,
        context,
        filepathBeingParsed: absolutePathToDocsConfiguration,
    });
}

export async function validateSchema({
    value,
    context,
    filepathBeingParsed,
}: {
    value: unknown;
    context: TaskContext;
    filepathBeingParsed: string;
}): Promise<RawDocsConfiguration> {
    const result = await RawDocsConfigurationSerializer.parse(value);
    if (result.ok) {
        return result.value;
    }

    const issues: string[] = result.errors.map((issue) => {
        const message = issue.path.length > 0 ? `${issue.message} at "${issue.path.join(" -> ")}"` : issue.message;
        return addPrefixToString({
            content: message,
            prefix: "  - ",
        });
    });

    const errorMessage = [`Failed to parse file: ${path.relative(process.cwd(), filepathBeingParsed)}`, ...issues].join(
        "\n"
    );

    return context.failAndThrow(errorMessage);
}
