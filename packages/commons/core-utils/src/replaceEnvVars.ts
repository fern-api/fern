import { isPlainObject } from "./objects/isPlainObject.js";
import { mapValues } from "./objects/mapValues.js";

/**
 * Captures templates inside "${}"
 * e.g. ${OPENAI_API_KEY}
 *
 * Example usage:
 * ```ts
 * "someContent".replace(ENV_VAR_REGEX, (substring, envVarName) => { ... });
 * ```
 */
export const ENV_VAR_REGEX = /\$\{(\w+)\}/g;

/**
 * Captures escaped env var patterns: \$\{VAR_NAME\}
 * These should be converted to literal ${VAR_NAME} without substitution.
 */
const ESCAPED_ENV_VAR_REGEX = /\\\$\\\{(\w+)\\}/g;

/**
 * Placeholder used to temporarily replace escaped env var patterns during substitution.
 * Uses a pattern unlikely to appear in normal content.
 */
const PLACEHOLDER_PREFIX = "\0ESCAPED_ENV_VAR\0";

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

/**
 * Immutably substitutes templated environment variables in the parameter with their values.
 *
 * If `substituteAsEmpty` is true, the variable is always replaced with an empty string, even if it is defined.
 *
 * `context.onError` is called when the environment variable is not defined and `substituteAsEmpty` is false.
 *
 * Escaped patterns using `\$\{VAR\}` are converted to literal `${VAR}` without substitution.
 *
 * @param content
 * @param context
 * @param options
 * @returns `content` with the templated variables substituted.
 */
export function replaceEnvVariables<T>(
    content: T,
    context: { onError: (message?: string) => unknown | void | never },
    options: { substituteAsEmpty?: boolean } = {}
): T {
    if (typeof content === "string") {
        const deferred = getDeferredEnvVars();

        // First, replace escaped patterns \$\{VAR\} with placeholders to protect them
        let transformed = (content as string).replace(ESCAPED_ENV_VAR_REGEX, (_substring, varName) => {
            return `${PLACEHOLDER_PREFIX}${varName}\0`;
        });

        // Then, substitute remaining (non-escaped) env var patterns
        transformed = transformed.replace(ENV_VAR_REGEX, (substring, envVarName, offset: number, whole: string) => {
            if (deferred.has(envVarName)) {
                return deferredPlaceholder(envVarName, whole.slice(0, offset), whole.slice(offset + substring.length));
            }
            if (options.substituteAsEmpty) {
                return "";
            }
            const envVarValue = process.env[envVarName];
            if (envVarValue == null) {
                context.onError(`Environment variable ${envVarName} is not defined.`);
            }
            return envVarValue ?? "";
        });

        // Finally, convert placeholders back to literal ${VAR} syntax
        transformed = transformed.replace(
            new RegExp(`${PLACEHOLDER_PREFIX.replace(/\0/g, "\\0")}(\\w+)\\0`, "g"),
            (_substring, varName) => `\${${varName}}`
        );

        return transformed as unknown as T;
    }

    // Handle arrays by recursively processing each element
    if (Array.isArray(content)) {
        return content.map((value) => replaceEnvVariables(value, context, options)) as unknown as T;
    }

    if (!isPlainObject(content)) {
        return content;
    }

    const transformed = mapValues(content, (value) => replaceEnvVariables(value, context, options));
    return transformed as unknown as T;
}
