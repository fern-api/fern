import { ENV_SUBSTITUTION_SOURCE, SUBSTITUTION_REGEX, substituteText } from "./substituteText.js";

/**
 * Captures templates inside "${}"
 * e.g. ${OPENAI_API_KEY}
 */
export const ENV_VAR_REGEX = SUBSTITUTION_REGEX;

/**
 * Immutably substitutes templated environment variables in the parameter with their values.
 *
 * Equivalent to `substituteText(content, ENV_SUBSTITUTION_SOURCE, context, options)`.
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
    return substituteText(content, ENV_SUBSTITUTION_SOURCE, context, {
        substituteAsEmpty: options.substituteAsEmpty,
        undefinedMessage: (name) => `Environment variable ${name} is not defined.`
    });
}
