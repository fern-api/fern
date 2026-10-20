import {
    DocsConfigurationWithResolvedRedirects,
    docsYml,
    getRedirectsFilepaths,
    loadRedirects
} from "@fern-api/configuration-loader";
import { extractErrorMessage, sanitizeNullValues, validateAgainstJsonSchema } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";
import { docsConfigFilePath, findDocsConfigFile } from "@fern-api/project-structure";
import { CliError, TaskContext } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";

import * as DocsYmlJsonSchema from "./docs-yml.schema.json";
import { DocsWorkspace } from "./types/Workspace.js";

export async function loadDocsWorkspace({
    fernDirectory,
    context
}: {
    fernDirectory: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsWorkspace | undefined> {
    const docsConfigurationFile = await findDocsConfigFile(fernDirectory);
    if (docsConfigurationFile == null) {
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
            absoluteFilepathToDocsConfig: docsConfigurationFile
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
}): Promise<DocsConfigurationWithResolvedRedirects | undefined> {
    if (!(await doesPathExist(absolutePathToDocsDefinition))) {
        return undefined;
    }
    return await loadRawDocsConfiguration({
        absolutePathOfConfiguration: docsConfigFilePath(absolutePathToDocsDefinition),
        context
    });
}

export async function loadRawDocsConfiguration({
    absolutePathOfConfiguration,
    context
}: {
    absolutePathOfConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<DocsConfigurationWithResolvedRedirects> {
    const contentsStr = await readFile(absolutePathOfConfiguration);
    let contentsJson: unknown;
    try {
        contentsJson = yaml.load(contentsStr.toString());
    } catch (error) {
        if (!(error instanceof yaml.YAMLException)) {
            throw error;
        }
        throw new CliError({
            message: `Failed to parse ${absolutePathOfConfiguration}: ${extractErrorMessage(error)}`,
            code: CliError.Code.ParseError
        });
    }
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

        let parsed: docsYml.RawSchemas.DocsConfiguration;
        try {
            context.logger.debug(`Attempting to parse sanitized docs configuration`);
            parsed = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(sanitizedJson);
        } catch (err) {
            context.logger.error(`Parsing failed even after sanitization: ${extractErrorMessage(err)}`);
            // Log the JSON structure to debug
            context.logger.debug(`Sanitized JSON structure: ${JSON.stringify(sanitizedJson, null, 2)}`);
            throw new CliError({
                message: `Failed to parse ${absolutePathOfConfiguration}: ${extractErrorMessage(err)}`,
                code: CliError.Code.ParseError
            });
        }

        // Errors are carried on the configuration rather than thrown so that they are reported by
        // docs validation, formatted like every other docs violation.
        const loadedRedirects = await loadRedirects({
            redirects: parsed.redirects,
            absoluteFilepathToDocsConfig: absolutePathOfConfiguration
        });

        return {
            ...parsed,
            redirects: loadedRedirects.redirects,
            _redirectsFileErrors: loadedRedirects.errors,
            _absoluteFilepathsToRedirectsFiles: getRedirectsFilepaths({
                redirects: parsed.redirects,
                absoluteFilepathToDocsConfig: absolutePathOfConfiguration
            })
        };
    } else {
        throw new CliError({
            message: `Failed to parse docs.yml:\n${result.error?.message ?? "Unknown error"}`,
            code: CliError.Code.ParseError
        });
    }
}
