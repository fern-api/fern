import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, doesPathExist, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";

const RedirectsFile = docsYml.DocsYmlSchemas.RedirectConfig.strict().array();

/**
 * A docs.yml configuration whose `redirects` filepath (if any) has already been read off disk.
 */
export type DocsConfigurationWithResolvedRedirects = Omit<docsYml.RawSchemas.DocsConfiguration, "redirects"> & {
    redirects?: docsYml.RawSchemas.RedirectConfig[];
};

/**
 * `redirects` accepts either an inline list or a relative filepath to a YAML file containing only
 * that list. Resolving the file here lets every downstream consumer work with a plain list.
 */
export async function resolveRedirects({
    redirects,
    absoluteFilepathToDocsConfig
}: {
    redirects: docsYml.RawSchemas.RedirectsConfiguration | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<docsYml.RawSchemas.RedirectConfig[] | undefined> {
    if (redirects == null || typeof redirects !== "string") {
        return redirects;
    }

    const absoluteFilepathToRedirects = resolve(dirname(absoluteFilepathToDocsConfig), RelativeFilePath.of(redirects));
    if (!(await doesPathExist(absoluteFilepathToRedirects))) {
        throw new CliError({
            message: `Failed to load redirects: ${absoluteFilepathToRedirects} does not exist`,
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

    const parsed = RedirectsFile.safeParse(contents ?? []);
    if (!parsed.success) {
        throw new CliError({
            message: `Failed to parse ${absoluteFilepathToRedirects}. The file must contain only a list of redirects:\n${parsed.error.issues
                .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
                .join("\n")}`,
            code: CliError.Code.ParseError
        });
    }

    return parsed.data;
}
