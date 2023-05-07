import { addPrefixToString } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsConfiguration as RawDocsConfiguration } from "@fern-fern/docs-config/api";
import { DocsConfiguration as RawDocsConfigurationSerializer } from "@fern-fern/docs-config/serialization";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

export async function loadRawDocsConfiguration({
    absolutePathOfConfiguration,
    context,
}: {
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<RawDocsConfiguration> {
    const contentsStr = await readFile(absolutePathOfConfiguration);
    const contentsJson = yaml.load(contentsStr.toString());
    return await validateSchema({
        value: contentsJson,
        context,
        filepathBeingParsed: absolutePathOfConfiguration,
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
