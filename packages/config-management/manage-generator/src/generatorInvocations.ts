import { GeneratorInvocationSchema } from "@fern-api/workspace-configuration";

export const JAVA_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-java",
    version: "0.0.84",
    generate: true,
    config: {
        packagePrefix: "com",
        mode: "client_and_server",
    },
};

export const TYPESCRIPT_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-typescript",
    version: "0.0.155",
    generate: true,
    config: {
        mode: "client_and_server",
    },
};

export const POSTMAN_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-postman",
    version: "0.0.21",
    generate: {
        enabled: true,
        output: "./generated-postman.json",
    },
};

export const OPENAPI_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-openapi",
    version: "0.0.4",
    generate: {
        enabled: true,
        output: "./generated-openapi.yml",
    },
    config: {
        format: "yaml",
    },
};

export function getGeneratorInvocationsByName(): Record<string, GeneratorInvocationSchema> {
    const result: Record<string, GeneratorInvocationSchema> = {};
    result[JAVA_GENERATOR_INVOCATION.name] = JAVA_GENERATOR_INVOCATION;
    result[TYPESCRIPT_GENERATOR_INVOCATION.name] = TYPESCRIPT_GENERATOR_INVOCATION;
    result[POSTMAN_GENERATOR_INVOCATION.name] = POSTMAN_GENERATOR_INVOCATION;
    result[OPENAPI_GENERATOR_INVOCATION.name] = OPENAPI_GENERATOR_INVOCATION;
    return result;
}
