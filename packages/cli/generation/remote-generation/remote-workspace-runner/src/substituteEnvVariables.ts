import { TaskContext } from "@fern-api/task-context";
import { isPlainObject, mapValues } from "lodash-es";

const ENV_VAR_REGEX = /\$\{(\w+)\}/g;

export function substituteEnvVariables<T>(content: T, context: TaskContext): T {
    if (typeof content === "string") {
        const transformed = content.replace(ENV_VAR_REGEX, (_substring, envVarName) => {
            const envVarValue = process.env[envVarName];
            if (envVarValue == null) {
                context.fail(`Environment variable ${envVarName} is not defined.`);
                return content;
            }
            return envVarValue;
        });
        return transformed as unknown as T;
    }

    if (!isPlainObject(content)) {
        return content;
    }

    const transformed = mapValues(content as unknown as object, (value: unknown) =>
        substituteEnvVariables(value, context)
    );
    return transformed as unknown as T;
}
