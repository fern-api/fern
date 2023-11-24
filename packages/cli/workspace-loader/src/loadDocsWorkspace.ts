import { addPrefixToString } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { DocsConfiguration, DocsConfiguration as RawDocsConfiguration } from "@fern-fern/docs-config/api";
import { DocsConfiguration as RawDocsConfigurationSerializer } from "@fern-fern/docs-config/serialization";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { DocsWorkspace } from "./types/Workspace";

export async function loadDocsWorkspace({
    fernDirectory,
    context
}: {
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsWorkspace | undefined> {
    const docsConfigurationFile = join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(docsConfigurationFile))) {
        return undefined;
    }

    const docsConfiguration = await loadDocsConfiguration({
        absolutePathToDocsDefinition: fernDirectory,
        context
    });
    if (docsConfiguration != null) {
        return {
            type: "docs",
            absoluteFilepath: fernDirectory,
            config: docsConfiguration,
            workspaceName: undefined,
            absoluteFilepathToDocsConfig: join(fernDirectory, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME))
        };
    }
    return undefined;
}

export async function loadDocsConfiguration({
    absolutePathToDocsDefinition,
    context
}: {
    absolutePathToDocsDefinition: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsConfiguration | undefined> {
    if (!(await doesPathExist(absolutePathToDocsDefinition))) {
        return undefined;
    }
    const absolutePathOfConfiguration = join(
        absolutePathToDocsDefinition,
        RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME)
    );
    return await loadRawDocsConfiguration({
        absolutePathOfConfiguration,
        context
    });
}

export async function loadRawDocsConfiguration({
    absolutePathOfConfiguration,
    context
}: {
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<RawDocsConfiguration> {
    const contentsStr = await readFile(absolutePathOfConfiguration);
    const contentsJson = yaml.load(contentsStr.toString());
    return await validateSchema({
        value: contentsJson,
        context,
        filepathBeingParsed: absolutePathOfConfiguration
    });
}

export async function validateSchema({
    value,
    context,
    filepathBeingParsed
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
            prefix: "  - "
        });
    });

    const errorMessage = [`Failed to parse file: ${path.relative(process.cwd(), filepathBeingParsed)}`, ...issues].join(
        "\n"
    );

    return context.failAndThrow(errorMessage);
}
