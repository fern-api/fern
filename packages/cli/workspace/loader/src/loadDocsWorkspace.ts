import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { addPrefixToString } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

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
            absoluteFilePath: fernDirectory,
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
}): Promise<docsYml.RawSchemas.DocsConfiguration | undefined> {
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
}): Promise<docsYml.RawSchemas.DocsConfiguration> {
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
}): Promise<docsYml.RawSchemas.DocsConfiguration> {
    const result = await docsYml.RawSchemas.Serializer.DocsConfiguration.parse(value);
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
