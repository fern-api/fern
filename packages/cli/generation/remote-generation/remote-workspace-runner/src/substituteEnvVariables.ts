import { TaskContext } from "@fern-api/task-context";
import { isArray, isPlainObject, mapValues } from "lodash-es";

const ENV_VAR_REGEX = /\$\{(\w+)\}/g;

export function substituteEnvVariables<T>(content: T, context: TaskContext): T {
    if (typeof content === "string") {
        const transformed = content.replaceAll(ENV_VAR_REGEX, (substring, envVarName) => {
            const envVarValue = process.env[envVarName];
            if (envVarValue == null) {
                context.fail(`Environment variable ${envVarName} is not defined.`);
                return substring;
            }
            return envVarValue;
        });
        return transformed as unknown as T;
    } else if (isArray(content)) {
        const transformed = content.map((item) => substituteEnvVariables(item, context));
        return transformed as unknown as T;
    } else if (isPlainObject(content)) {
        const transformed = mapValues(content as unknown as object, (value: unknown) =>
            substituteEnvVariables(value, context)
        );
        return transformed as unknown as T;
    } else {
        return content;
    }
}
