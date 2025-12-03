import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration-loader";
import { sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import * as DocsYmlJsonSchema from "./docs-yml.schema.json";
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
    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    const result = validateAgainstJsonSchema(contentsJson, DocsYmlJsonSchema as any, {
        filePath: absolutePathOfConfiguration
    });
    if (result.success) {
        // Proactively sanitize null/undefined values before parsing
        const removedPaths: string[][] = [];
        context.logger.debug(`About to sanitize docs configuration JSON structure`);
        const sanitizedJson = sanitizeNullValues(contentsJson, [], removedPaths);

        if (removedPaths.length > 0) {
            context.logger.warn(
                `docs.yml contained null/undefined sections that were ignored: ${removedPaths.map((p) => p.join(".")).join(", ")}`
            );
        } else {
            context.logger.debug(`No null/undefined values found during sanitization`);
        }

        try {
            context.logger.debug(`Attempting to parse sanitized docs configuration`);
            return docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(sanitizedJson);
        } catch (err) {
            context.logger.error(
                `Parsing failed even after sanitization: ${err instanceof Error ? err.message : String(err)}`
            );
            // Log the JSON structure to debug
            context.logger.debug(`Sanitized JSON structure: ${JSON.stringify(sanitizedJson, null, 2)}`);
            throw new Error(
                `Failed to parse ${absolutePathOfConfiguration}: ${err instanceof Error ? err.message : String(err)}`
            );
        }
    } else {
        throw new Error(`Failed to parse docs.yml:\n${result.error?.message ?? "Unknown error"}`);
    }
}
