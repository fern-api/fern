import { isPlainObject } from "./objects/isPlainObject.js";
import { mapValues } from "./objects/mapValues.js";

/**
 * Captures substitution templates inside "${}"
 * e.g. ${OPENAI_API_KEY} or ${version}
 *
 * Example usage:
 * ```ts
 * "someContent".replace(SUBSTITUTION_REGEX, (substring, name) => { ... });
 * ```
 */
export const SUBSTITUTION_REGEX = /\$\{(\w+)\}/g;

/**
 * Captures escaped substitution patterns: \$\{NAME\}
 * These should be converted to literal ${NAME} without substitution.
 */
const ESCAPED_SUBSTITUTION_REGEX = /\\\$\\\{(\w+)\\}/g;

/**
 * Placeholder used to temporarily replace escaped patterns during substitution.
 * Uses a pattern unlikely to appear in normal content.
 */
const PLACEHOLDER_PREFIX = "\0ESCAPED_SUBSTITUTION\0";

/**
 * Names listed here are not resolved during generation. They are rewritten to
 * `FERN_SELF_HOSTED_ENV_<NAME>`, which the self-hosted container resolves on every
 * request, so one generated image can serve several deployments.
 */
const DEFERRED_ENV_VARS_ENV_VAR = "FERN_RUNTIME_ENV_VARS";

const DEFERRED_PLACEHOLDER_PREFIX = "FERN_SELF_HOSTED_ENV_";

/**
 * `${VAR}` in a link target has to stay an absolute URL, or markdown resolves it as a
 * relative path and rewrites it before the container ever sees the placeholder.
 */
const URL_POSITION_REGEX = /(\]\(|\b(?:href|src|url|action|content)\s*[=:]\s*["']?)$/i;

/**
 * Resolves a substitution name to its value, or `undefined` when the name is unknown
 * to this source.
 */
export type SubstitutionSource = (name: string) => string | undefined;

/**
 * Resolves names from the process environment.
 */
export const ENV_SUBSTITUTION_SOURCE: SubstitutionSource = (name) => process.env[name];

/**
 * Resolves names from a static map, e.g. the `substitutions` block of docs.yml.
 */
export function mapSubstitutionSource(substitutions: Record<string, string>): SubstitutionSource {
    return (name) => (Object.hasOwn(substitutions, name) ? substitutions[name] : undefined);
}

/**
 * Combines sources; the first source that knows the name wins.
 */
export function chainSubstitutionSources(...sources: SubstitutionSource[]): SubstitutionSource {
    return (name) => {
        for (const source of sources) {
            const value = source(name);
            if (value != null) {
                return value;
            }
        }
        return undefined;
    };
}

function getDeferredEnvVars(): Set<string> {
    const raw = process.env[DEFERRED_ENV_VARS_ENV_VAR];
    if (raw == null) {
        return new Set();
    }
    return new Set(raw.split(/[,\s]+/).filter((name) => /^\w+$/.test(name)));
}

/**
 * The placeholder that replaces `${name}`, carrying a scheme when the occurrence is a URL
 * so the link survives generation. The container drops that scheme again if the runtime
 * value brings its own.
 */
function deferredPlaceholder(name: string, before: string, after: string): string {
    const placeholder = `${DEFERRED_PLACEHOLDER_PREFIX}${name}`;
    if (/:\/\/$/.test(before)) {
        return placeholder;
    }
    const isUrl = URL_POSITION_REGEX.test(before) || (before === "" && (after === "" || after.startsWith("/")));
    return isUrl ? `https://${placeholder}` : placeholder;
}

export interface SubstituteTextOptions {
    /** When true, every `${name}` is replaced with an empty string, even if the source resolves it. */
    substituteAsEmpty?: boolean;
    /** When true, an unresolved `${name}` becomes an empty string without calling `context.onError`. */
    undefinedAsEmpty?: boolean;
    /** Builds the message passed to `context.onError` for an unresolved name. */
    undefinedMessage?: (name: string) => string;
}

const DEFAULT_UNDEFINED_MESSAGE = (name: string): string => `Substitution ${name} is not defined.`;

/**
 * Immutably substitutes `${name}` templates in the parameter with values from `source`,
 * recursing into arrays and plain objects.
 *
 * If `options.substituteAsEmpty` is true, the template is always replaced with an empty string,
 * even if the source resolves it.
 *
 * `context.onError` is called when the source does not resolve the name, unless `substituteAsEmpty`
 * or `undefinedAsEmpty` is true.
 *
 * Escaped patterns using `\$\{NAME\}` are converted to literal `${NAME}` without substitution.
 *
 * @param content
 * @param source
 * @param context
 * @param options
 * @returns `content` with the templates substituted.
 */
export function substituteText<T>(
    content: T,
    source: SubstitutionSource,
    context: { onError: (message?: string) => unknown | void | never },
    options: SubstituteTextOptions = {}
): T {
    if (typeof content === "string") {
        const deferred = getDeferredEnvVars();

        // First, replace escaped patterns \$\{NAME\} with placeholders to protect them
        let transformed = (content as string).replace(ESCAPED_SUBSTITUTION_REGEX, (_substring, name) => {
            return `${PLACEHOLDER_PREFIX}${name}\0`;
        });

        // Then, substitute remaining (non-escaped) patterns
        transformed = transformed.replace(SUBSTITUTION_REGEX, (substring, name, offset: number, whole: string) => {
            if (deferred.has(name)) {
                return deferredPlaceholder(name, whole.slice(0, offset), whole.slice(offset + substring.length));
            }
            if (options.substituteAsEmpty) {
                return "";
            }
            const value = source(name);
            if (value == null && !options.undefinedAsEmpty) {
                context.onError((options.undefinedMessage ?? DEFAULT_UNDEFINED_MESSAGE)(name));
            }
            return value ?? "";
        });

        // Finally, convert placeholders back to literal ${NAME} syntax
        transformed = transformed.replace(
            new RegExp(`${PLACEHOLDER_PREFIX.replace(/\0/g, "\\0")}(\\w+)\\0`, "g"),
            (_substring, name) => `\${${name}}`
        );

        return transformed as unknown as T;
    }

    // Handle arrays by recursively processing each element
    if (Array.isArray(content)) {
        return content.map((value) => substituteText(value, source, context, options)) as unknown as T;
    }

    if (!isPlainObject(content)) {
        return content;
    }

    const transformed = mapValues(content, (value) => substituteText(value, source, context, options));
    return transformed as unknown as T;
}
