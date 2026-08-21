import { docsYml } from "@fern-api/configuration";
import { extractErrorMessage, sanitizeNullValues } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import type { Stats } from "fs";
import { readFile, stat } from "fs/promises";
import yaml from "js-yaml";

const RedirectsFile = docsYml.DocsYmlSchemas.RedirectsFile;

/**
 * A docs.yml configuration whose `redirects` filepath (if any) has already been read off disk.
 */
export type DocsConfigurationWithResolvedRedirects = Omit<docsYml.RawSchemas.DocsConfiguration, "redirects"> & {
    redirects?: docsYml.RawSchemas.RedirectConfig[];
    /** The external files that `redirects` referenced, if any. Consumers watch these for changes. */
    _absoluteFilepathsToRedirectsFiles?: AbsoluteFilePath[];
};

/**
 * `redirects` accepts either an inline list of redirects, or one or more filepaths to YAML files
 * containing only that list. Resolving the files here lets every downstream consumer work with a
 * plain list.
 */
export async function resolveRedirects({
    redirects,
    absoluteFilepathToDocsConfig
}: {
    redirects: docsYml.RawSchemas.RedirectsConfiguration | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<docsYml.RawSchemas.RedirectConfig[] | undefined> {
    if (redirects == null) {
        return undefined;
    }

    const entries: (string | docsYml.RawSchemas.RedirectConfig)[] =
        typeof redirects === "string" ? [redirects] : redirects;
    if (isRedirectList(entries)) {
        return entries;
    }
    if (!isFilepathList(entries)) {
        throw new CliError({
            message:
                "Failed to load redirects: `redirects` must be either a list of redirects or a list of filepaths, not a mix of both",
            code: CliError.Code.ParseError
        });
    }

    const loaded = await Promise.all(
        entries.map((filepath) => loadRedirectsFile({ filepath, absoluteFilepathToDocsConfig }))
    );
    return loaded.flat();
}

/**
 * The external files that `redirects` references, if any. Returns an empty list for an inline
 * list of redirects.
 */
export function getRedirectsFilepaths({
    redirects,
    absoluteFilepathToDocsConfig
}: {
    redirects: docsYml.RawSchemas.RedirectsConfiguration | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): AbsoluteFilePath[] {
    if (redirects == null) {
        return [];
    }
    const entries: (string | docsYml.RawSchemas.RedirectConfig)[] =
        typeof redirects === "string" ? [redirects] : redirects;
    if (!isFilepathList(entries)) {
        return [];
    }
    return entries
        .filter((filepath) => filepath.trim().length > 0)
        .map((filepath) => resolve(dirname(absoluteFilepathToDocsConfig), filepath));
}

function isRedirectList(
    redirects: (string | docsYml.RawSchemas.RedirectConfig)[]
): redirects is docsYml.RawSchemas.RedirectConfig[] {
    return redirects.every((redirect) => typeof redirect !== "string");
}

function isFilepathList(redirects: (string | docsYml.RawSchemas.RedirectConfig)[]): redirects is string[] {
    return redirects.every((redirect) => typeof redirect === "string");
}

function isNotFoundError(error: unknown): boolean {
    return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function loadRedirectsFile({
    filepath,
    absoluteFilepathToDocsConfig
}: {
    filepath: string;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<docsYml.RawSchemas.RedirectConfig[]> {
    if (filepath.trim().length === 0) {
        throw new CliError({
            message: "Failed to load redirects: `redirects` contains an empty filepath",
            code: CliError.Code.ParseError
        });
    }

    const absoluteFilepathToRedirects = resolve(dirname(absoluteFilepathToDocsConfig), filepath);
    // stat (rather than lstat) so that a symlink to a redirects file is accepted.
    let stats: Stats;
    try {
        stats = await stat(absoluteFilepathToRedirects);
    } catch (error) {
        throw new CliError({
            message: isNotFoundError(error)
                ? `Failed to load redirects: ${absoluteFilepathToRedirects} does not exist`
                : `Failed to load redirects from ${absoluteFilepathToRedirects}: ${extractErrorMessage(error)}`,
            code: CliError.Code.ParseError
        });
    }
    if (!stats.isFile()) {
        throw new CliError({
            message: `Failed to load redirects: ${absoluteFilepathToRedirects} is not a file`,
            code: CliError.Code.ParseError
        });
    }

    let rawContents: string;
    try {
        rawContents = (await readFile(absoluteFilepathToRedirects)).toString();
    } catch (error) {
        throw new CliError({
            message: `Failed to read ${absoluteFilepathToRedirects}: ${extractErrorMessage(error)}`,
            code: CliError.Code.ParseError
        });
    }

    let contents: unknown;
    try {
        contents = yaml.load(rawContents);
    } catch (error) {
        if (!(error instanceof yaml.YAMLException)) {
            throw error;
        }
        throw new CliError({
            message: `Failed to parse ${absoluteFilepathToRedirects}: ${error.message}`,
            code: CliError.Code.ParseError
        });
    }

    if (contents == null) {
        throw new CliError({
            message: `Failed to parse ${absoluteFilepathToRedirects}: the file is empty and must contain a \`redirects\` list`,
            code: CliError.Code.ParseError
        });
    }

    if (Array.isArray(contents)) {
        throw new CliError({
            message: `Failed to parse ${absoluteFilepathToRedirects}: the file must nest the list under a top-level \`redirects\` key`,
            code: CliError.Code.ParseError
        });
    }

    // docs.yml itself is sanitized before parsing, so nulls are tolerated the same way here.
    const parsed = RedirectsFile.safeParse(sanitizeNullValues(contents));
    if (!parsed.success) {
        throw new CliError({
            message: `Failed to parse ${absoluteFilepathToRedirects}. The file must contain only a \`redirects\` list:\n${parsed.error.issues
                .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
                .join("\n")}`,
            code: CliError.Code.ParseError
        });
    }

    return parsed.data.redirects;
}
