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
 * Immutably substitutes templated environment variables in the parameter with their values.
 *
 * If `substituteAsEmpty` is true, the variable is always replaced with an empty string, even if it is defined.
 *
 * `context.onError` is called when the environment variable is not defined and `substituteAsEmpty` is false.
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
        const transformed = (content as string).replace(ENV_VAR_REGEX, (_substring, envVarName) => {
            if (options.substituteAsEmpty) {
                return "";
            }
            const envVarValue = process.env[envVarName];
            if (envVarValue == null) {
                context.onError(`Environment variable ${envVarName} is not defined.`);
            }
            return envVarValue ?? "";
        });
        return transformed as unknown as T;
    }

    if (!isPlainObject(content)) {
        return content;
    }

    const transformed = mapValues(content, (value) => replaceEnvVariables(value, context, options));
    return transformed as unknown as T;
}
