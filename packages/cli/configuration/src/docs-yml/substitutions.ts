import {
    chainSubstitutionSources,
    ENV_SUBSTITUTION_SOURCE,
    mapSubstitutionSource,
    type SubstitutionSource,
    substituteText
} from "@fern-api/core-utils";

import type { DocsConfiguration } from "./schemas/index.js";

/** The parts of a docs.yml configuration that define text substitutions. */
export type DocsSubstitutionConfig = Pick<DocsConfiguration, "substitutions" | "settings">;

export interface DocsSubstitutionContext {
    onError: (message?: string) => unknown | void | never;
}

export interface DocsSubstitutionOptions {
    /**
     * Preview mode. Unless `settings.substitute-env-vars` is enabled, environment variables are
     * not read and any `${name}` that the docs.yml `substitutions` map does not define becomes
     * an empty string instead of an error.
     */
    preview?: boolean;
}

export function hasDocsSubstitutions(config: DocsSubstitutionConfig): boolean {
    return config.substitutions != null || config.settings?.substituteEnvVars === true;
}

/**
 * Builds the `${name}` resolver for a docs.yml configuration: the top-level `substitutions`
 * map first, then the process environment when `settings.substitute-env-vars` is enabled.
 */
export function createDocsSubstitutionSource(config: DocsSubstitutionConfig): SubstitutionSource {
    const sources: SubstitutionSource[] = [];
    if (config.substitutions != null) {
        sources.push(mapSubstitutionSource(config.substitutions));
    }
    if (config.settings?.substituteEnvVars === true) {
        sources.push(ENV_SUBSTITUTION_SOURCE);
    }
    return chainSubstitutionSources(...sources);
}

/**
 * Applies the docs.yml substitutions (and, when enabled, environment variables) to `content`.
 * Returns `content` unchanged when the configuration defines no substitution source.
 */
export function applyDocsSubstitutions<T>(
    config: DocsSubstitutionConfig,
    content: T,
    context: DocsSubstitutionContext,
    { preview = false }: DocsSubstitutionOptions = {}
): T {
    if (!preview && !hasDocsSubstitutions(config)) {
        return content;
    }
    const readEnv = config.settings?.substituteEnvVars === true;
    return substituteText(content, createDocsSubstitutionSource(config), context, {
        undefinedAsEmpty: preview && !readEnv,
        undefinedMessage: (name) => undefinedSubstitutionMessage(config, name)
    });
}

/**
 * Where the pages of one version take their substitution values from. Names resolve in
 * order: the version file's `substitutions`, then the docs.yml `substitutions`, then the
 * environment when that docs.yml enables `settings.substitute-env-vars`.
 *
 * A working-tree version leaves `docsConfig` undefined and uses the current docs.yml; a
 * git-ref-backed version carries the docs.yml at the ref, so the current branch never
 * supplies values for a tagged release.
 */
export interface VersionSubstitutions {
    /** The `substitutions` map of the version file, highest precedence. */
    versionFile: Record<string, string> | undefined;
    /** The docs.yml that shipped with the version's pages; undefined for the current docs.yml. */
    docsConfig: DocsSubstitutionConfig | undefined;
    /** The git ref the version is built from, or undefined for the working tree. */
    ref: string | undefined;
}

/** Resolves every `${name}` in page text against the sources of one version (or of the site). */
export type PageSubstituter = (content: string) => string;

/**
 * Builds the substituter for the pages of one version, so the source chain is built once
 * per version rather than once per page. Pages outside any version pass
 * `versionSubstitutions: undefined` and resolve against `siteConfig` alone. The
 * substituter returns its input unchanged when no source is configured.
 */
export function createPageSubstituter(
    versionSubstitutions: VersionSubstitutions | undefined,
    siteConfig: DocsSubstitutionConfig,
    context: DocsSubstitutionContext,
    { preview = false }: DocsSubstitutionOptions = {}
): PageSubstituter {
    const versionFile = versionSubstitutions?.versionFile;
    const docsConfig = versionSubstitutions?.docsConfig ?? siteConfig;
    if (!preview && versionFile == null && !hasDocsSubstitutions(docsConfig)) {
        return (content) => content;
    }
    const readEnv = docsConfig.settings?.substituteEnvVars === true;
    const source =
        versionFile != null
            ? chainSubstitutionSources(mapSubstitutionSource(versionFile), createDocsSubstitutionSource(docsConfig))
            : createDocsSubstitutionSource(docsConfig);
    const options = {
        undefinedAsEmpty: preview && !readEnv,
        undefinedMessage: (name: string) =>
            versionSubstitutions == null
                ? undefinedSubstitutionMessage(docsConfig, name)
                : undefinedVersionSubstitutionMessage(versionSubstitutions.ref, docsConfig, name)
    };
    return (content) => substituteText(content, source, context, options);
}

function undefinedVersionSubstitutionMessage(
    ref: string | undefined,
    docsConfig: DocsSubstitutionConfig,
    name: string
): string {
    const where = ref == null ? "the version file or docs.yml" : `the version file or docs.yml at git ref '${ref}'`;
    return docsConfig.settings?.substituteEnvVars === true
        ? `Substitution ${name} is not defined in ${where} or the environment.`
        : `Substitution ${name} is not defined in ${where}.`;
}

function undefinedSubstitutionMessage(config: DocsSubstitutionConfig, name: string): string {
    if (config.substitutions == null) {
        return `Environment variable ${name} is not defined.`;
    }
    if (config.settings?.substituteEnvVars === true) {
        return `Substitution ${name} is not defined in docs.yml substitutions or the environment.`;
    }
    return `Substitution ${name} is not defined in docs.yml substitutions.`;
}
