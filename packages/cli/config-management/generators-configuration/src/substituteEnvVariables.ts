import isPlainObject from "lodash-es/isPlainObject";
import set from "lodash-es/set";

export function substituteEnvVariables(yaml: unknown): unknown {
    const processedYaml = {};
    substituteEnvVariablesHelper(processedYaml, yaml);
    return processedYaml;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function substituteEnvVariablesHelper(target: Record<string, any>, value: any, key?: string): unknown {
    if ((isPlainObject(value) || Array.isArray(value)) && Object.keys(value).length > 0) {
        for (const [subKey, subVal] of Object.entries(value)) {
            substituteEnvVariablesHelper(target, subVal, key ? `${key}.${subKey}` : subKey);
        }
    } else if (key !== undefined) {
        set(target, key, typeof value === "string" ? replaceStringWithEnvVariable(value) : value);
    }
    return target;
}

function replaceStringWithEnvVariable(val: string): string {
    return val.replace(/\$\{(\w+)\}/g, (_substring, envVarName) => {
        return process.env[envVarName] ?? "";
    });
}
