import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, doesPathExist, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";

const RedirectsFile = docsYml.DocsYmlSchemas.RedirectsFile;

/**
 * A docs.yml configuration whose `redirects` filepath (if any) has already been read off disk.
 */
export type DocsConfigurationWithResolvedRedirects = Omit<docsYml.RawSchemas.DocsConfiguration, "redirects"> & {
    redirects?: docsYml.RawSchemas.RedirectConfig[];
};

function isFilepathList(redirects: docsYml.RawSchemas.RedirectsConfiguration): redirects is string[] {
    return Array.isArray(redirects) && redirects.every((redirect) => typeof redirect === "string");
}

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

    if (typeof redirects === "string") {
        return await loadRedirectsFile({ filepath: redirects, absoluteFilepathToDocsConfig });
    }

    if (!isFilepathList(redirects)) {
        return redirects;
    }

    const loaded = await Promise.all(
        redirects.map((filepath) => loadRedirectsFile({ filepath, absoluteFilepathToDocsConfig }))
    );
    return loaded.flat();
}

async function loadRedirectsFile({
    filepath,
    absoluteFilepathToDocsConfig
}: {
    filepath: string;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<docsYml.RawSchemas.RedirectConfig[]> {
    const absoluteFilepathToRedirects = resolve(dirname(absoluteFilepathToDocsConfig), filepath);
    if (filepath.trim().length === 0 || !(await doesPathExist(absoluteFilepathToRedirects, "file"))) {
        throw new CliError({
            message: `Failed to load redirects: ${absoluteFilepathToRedirects} is not a file`,
            code: CliError.Code.ParseError
        });
    }

    let contents: unknown;
    try {
        contents = yaml.load((await readFile(absoluteFilepathToRedirects)).toString());
    } catch (error) {
        if (!(error instanceof yaml.YAMLException)) {
            throw error;
        }
        throw new CliError({
            message: `Failed to parse ${absoluteFilepathToRedirects}: ${error.message}`,
            code: CliError.Code.ParseError
        });
    }

    const parsed = RedirectsFile.safeParse(contents ?? { redirects: [] });
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
