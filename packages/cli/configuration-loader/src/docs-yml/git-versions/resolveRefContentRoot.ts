import { DOCS_CONFIGURATION_FILENAME, docsYml } from "@fern-api/configuration";
import { sanitizeNullValues } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { MaterializedGitRef } from "./materializeGitRef.js";

/**
 * The content root selected for a git-ref-backed version: the navigation to build
 * plus the config file that anchors relative page paths, and the libraries declared
 * at the ref.
 */
export interface ResolvedRefContentRoot {
    tabs: docsYml.RawSchemas.VersionFileConfig["tabs"];
    landingPage: docsYml.RawSchemas.VersionFileConfig["landingPage"];
    navigation: docsYml.RawSchemas.NavigationConfig;
    absoluteFilepathToConfig: AbsoluteFilePath;
    rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> | undefined;
}

async function loadYamlFile(absoluteFilepath: AbsoluteFilePath, context: TaskContext): Promise<unknown> {
    let contents: unknown;
    try {
        contents = yaml.load((await readFile(absoluteFilepath)).toString());
    } catch (error) {
        if (error instanceof yaml.YAMLException) {
            throw new CliError({
                message: `Failed to parse ${absoluteFilepath}: ${error.message}`,
                code: CliError.Code.ParseError
            });
        }
        throw error;
    }
    return sanitizeNullValues(contents, [], []);
}

async function readVersionFile({
    absoluteFilepathToConfig,
    rawLibraries,
    context
}: {
    absoluteFilepathToConfig: AbsoluteFilePath;
    rawLibraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> | undefined;
    context: TaskContext;
}): Promise<ResolvedRefContentRoot> {
    const parsed = docsYml.RawSchemas.Serializer.VersionFileConfig.parseOrThrow(
        await loadYamlFile(absoluteFilepathToConfig, context)
    );
    return {
        tabs: parsed.tabs,
        landingPage: parsed.landingPage,
        navigation: parsed.navigation,
        absoluteFilepathToConfig,
        rawLibraries
    };
}

/**
 * Selects the content root for a ref-backed version, in order:
 * 1. the ref's docs.yml `versions[0].path` (the default version at the ref),
 * 2. else the ref's top-level `navigation`.
 *
 * The ref's own `versions` list is never recursed into beyond reading `versions[0].path`;
 * it is a stale snapshot pointing at even older refs.
 */
export async function resolveRefContentRoot({
    materialized,
    context
}: {
    materialized: MaterializedGitRef;
    context: TaskContext;
}): Promise<ResolvedRefContentRoot> {
    const refFernFolder = materialized.absolutePathToFernFolder;
    const refDocsConfigPath = join(refFernFolder, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));

    const refDocsConfig = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(
        await loadYamlFile(refDocsConfigPath, context)
    );
    const rawLibraries = refDocsConfig.libraries;

    const firstVersionPath = refDocsConfig.versions?.[0]?.path;
    if (firstVersionPath != null) {
        return readVersionFile({
            absoluteFilepathToConfig: resolve(refFernFolder, RelativeFilePath.of(firstVersionPath)),
            rawLibraries,
            context
        });
    }

    if (refDocsConfig.navigation != null) {
        return {
            tabs: refDocsConfig.tabs,
            landingPage: undefined,
            navigation: refDocsConfig.navigation,
            absoluteFilepathToConfig: refDocsConfigPath,
            rawLibraries
        };
    }

    throw new CliError({
        message:
            `Could not determine the content root for git ref '${materialized.ref}' (${materialized.sha}). ` +
            "Ensure the ref's docs.yml declares a default version or top-level navigation.",
        code: CliError.Code.ConfigError
    });
}
