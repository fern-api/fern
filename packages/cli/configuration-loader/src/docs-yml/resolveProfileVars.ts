import { docsYml } from "@fern-api/configuration";
import { extractErrorMessage, isEnoentError, sanitizeNullValues } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, resolve } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { readFile } from "fs/promises";
import yaml from "js-yaml";

const ProfileVarsFile = docsYml.DocsYmlSchemas.ProfileVarsFile;

/** A profile whose `vars` filepaths (if any) have already been read off disk. */
export type ProfileConfigWithResolvedVars = Omit<docsYml.RawSchemas.ProfileConfig, "vars"> & {
    vars?: Record<string, string>;
};

export interface LoadedProfiles {
    profiles: Record<string, ProfileConfigWithResolvedVars> | undefined;
    errors: string[];
}

/**
 * A profile's `vars` accepts either an inline map, or one or more filepaths to YAML files containing
 * only a `vars` map. Resolving the files here lets every downstream consumer work with a plain map.
 */
export async function resolveProfiles({
    profiles,
    absoluteFilepathToDocsConfig
}: {
    profiles: Record<string, docsYml.RawSchemas.ProfileConfig> | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<Record<string, ProfileConfigWithResolvedVars> | undefined> {
    const { profiles: loaded, errors } = await loadProfiles({ profiles, absoluteFilepathToDocsConfig });
    const [firstError] = errors;
    if (firstError != null) {
        throw new CliError({
            message: errors.length === 1 ? firstError : errors.map((error) => `- ${error}`).join("\n"),
            code: CliError.Code.ParseError
        });
    }
    return loaded;
}

/**
 * Same as {@link resolveProfiles}, but returns the errors encountered while reading the referenced
 * files instead of throwing, so that callers can report them alongside other docs violations.
 */
export async function loadProfiles({
    profiles,
    absoluteFilepathToDocsConfig
}: {
    profiles: Record<string, docsYml.RawSchemas.ProfileConfig> | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<LoadedProfiles> {
    if (profiles == null) {
        return { profiles: undefined, errors: [] };
    }
    const errors: string[] = [];
    const entries = await Promise.all(
        Object.entries(profiles).map(async ([name, profile]): Promise<[string, ProfileConfigWithResolvedVars]> => {
            const { vars, errors: profileErrors } = await loadProfileVars({
                name,
                vars: profile.vars,
                absoluteFilepathToDocsConfig
            });
            errors.push(...profileErrors);
            return [name, { ...profile, vars }];
        })
    );
    return { profiles: Object.fromEntries(entries), errors };
}

/** The external files that any profile's `vars` references. */
export function getProfileVarsFilepaths({
    profiles,
    absoluteFilepathToDocsConfig
}: {
    profiles: Record<string, docsYml.RawSchemas.ProfileConfig> | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): AbsoluteFilePath[] {
    return Object.values(profiles ?? {})
        .flatMap((profile) => toFilepaths(profile.vars))
        .filter((filepath) => filepath.trim().length > 0)
        .map((filepath) => resolve(dirname(absoluteFilepathToDocsConfig), filepath));
}

function toFilepaths(vars: docsYml.RawSchemas.ProfileVarsConfiguration | undefined): string[] {
    if (vars == null) {
        return [];
    }
    if (typeof vars === "string") {
        return [vars];
    }
    return Array.isArray(vars) ? vars : [];
}

async function loadProfileVars({
    name,
    vars,
    absoluteFilepathToDocsConfig
}: {
    name: string;
    vars: docsYml.RawSchemas.ProfileVarsConfiguration | undefined;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<{ vars: Record<string, string> | undefined; errors: string[] }> {
    if (vars == null || (typeof vars !== "string" && !Array.isArray(vars))) {
        return { vars, errors: [] };
    }
    const filepaths = toFilepaths(vars);
    // Every file is loaded before reporting, so that all invalid files are surfaced at once.
    const results = await Promise.allSettled(
        filepaths.map((filepath) => loadProfileVarsFile({ name, filepath, absoluteFilepathToDocsConfig }))
    );
    const errors: string[] = [];
    const merged: Record<string, string> = {};
    const definedIn: Record<string, string> = {};
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            if (!(result.reason instanceof CliError)) {
                throw result.reason;
            }
            errors.push(result.reason.message);
            return;
        }
        const filepath = filepaths[index] ?? "";
        for (const [key, value] of Object.entries(result.value)) {
            const previous = definedIn[key];
            if (previous != null) {
                errors.push(
                    `Failed to load vars for profile "${name}": ${key} is defined in both ${previous} and ${filepath}`
                );
                continue;
            }
            definedIn[key] = filepath;
            merged[key] = value;
        }
    });
    return { vars: merged, errors };
}

async function loadProfileVarsFile({
    name,
    filepath,
    absoluteFilepathToDocsConfig
}: {
    name: string;
    filepath: string;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
}): Promise<Record<string, string>> {
    const prefix = `Failed to load vars for profile "${name}"`;
    if (filepath.trim().length === 0) {
        throw new CliError({
            message: `${prefix}: \`vars\` contains an empty filepath`,
            code: CliError.Code.ParseError
        });
    }
    const absoluteFilepath = resolve(dirname(absoluteFilepathToDocsConfig), filepath);

    let rawContents: string;
    try {
        rawContents = (await readFile(absoluteFilepath)).toString();
    } catch (error) {
        throw new CliError({
            message:
                error instanceof Error && isEnoentError(error)
                    ? `${prefix}: ${absoluteFilepath} does not exist`
                    : `${prefix} from ${absoluteFilepath}: ${extractErrorMessage(error)}`,
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
            message: `Failed to parse ${absoluteFilepath}: ${error.message}`,
            code: CliError.Code.ParseError
        });
    }

    const parsed = ProfileVarsFile.safeParse(sanitizeNullValues(contents ?? {}));
    if (!parsed.success) {
        throw new CliError({
            message: `Failed to parse ${absoluteFilepath}. The file must contain only a \`vars\` map of names to strings:\n${parsed.error.issues
                .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
                .join("\n")}`,
            code: CliError.Code.ParseError
        });
    }
    return parsed.data.vars;
}
