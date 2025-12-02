import { isPlainObject } from "./objects/isPlainObject";
import { mapValues } from "./objects/mapValues";

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
        // First, replace escaped patterns \$\{VAR\} with placeholders to protect them
        let transformed = (content as string).replace(ESCAPED_ENV_VAR_REGEX, (_substring, varName) => {
            return `${PLACEHOLDER_PREFIX}${varName}\0`;
        });

        // Then, substitute remaining (non-escaped) env var patterns
        transformed = transformed.replace(ENV_VAR_REGEX, (_substring, envVarName) => {
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

    if (!isPlainObject(content)) {
        return content;
    }

    const transformed = mapValues(content, (value) => replaceEnvVariables(value, context, options));
    return transformed as unknown as T;
}
