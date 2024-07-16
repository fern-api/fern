import { TaskContext } from "@fern-api/task-context";
import { isPlainObject, mapValues } from "lodash-es";

const ENV_VAR_REGEX = /\$\{(\w+)\}/g;

export declare namespace SubstituteEnvVariables {
    interface Opts {
        /* Substitues all environment variables as empty strings. */
        substituteAsEmpty?: boolean;
    }
}

export function substituteEnvVariables<T>(
    content: T,
    context: TaskContext,
    options: SubstituteEnvVariables.Opts = {}
): T {
    if (typeof content === "string") {
        const transformed = (content as string).replace(ENV_VAR_REGEX, (_substring, envVarName) => {
            if (options.substituteAsEmpty) {
                return "";
            }
            const envVarValue = process.env[envVarName];
            if (envVarValue == null) {
                context.failAndThrow(`Environment variable ${envVarName} is not defined.`);
            }
            return envVarValue;
        });
        return transformed as unknown as T;
    }

    if (!isPlainObject(content)) {
        return content;
    }

    const transformed = mapValues(content as unknown as object, (value: unknown) =>
        substituteEnvVariables(value, context, options)
    );
    return transformed as unknown as T;
}
