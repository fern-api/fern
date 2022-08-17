import { GeneratorInvocationSchema } from "@fern-api/workspace-configuration";

export const JAVA_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-java",
    version: "0.0.87",
    generate: true,
    config: {
        packagePrefix: "com",
        mode: "client_and_server",
    },
};

export const TYPESCRIPT_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-typescript",
    version: "0.0.188",
    generate: true,
    config: {
        mode: "client_and_server",
    },
};

export const POSTMAN_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-postman",
    version: "0.0.22",
    generate: {
        enabled: true,
        output: "./generated-postman.json",
    },
};

export const OPENAPI_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-openapi",
    version: "0.0.5",
    generate: {
        enabled: true,
        output: "./generated-openapi.yml",
    },
    config: {
        format: "yaml",
    },
};

export const GENERATOR_INVOCATIONS: Record<string, GeneratorInvocationSchema> = {
    [JAVA_GENERATOR_INVOCATION.name]: JAVA_GENERATOR_INVOCATION,
    [TYPESCRIPT_GENERATOR_INVOCATION.name]: TYPESCRIPT_GENERATOR_INVOCATION,
    [POSTMAN_GENERATOR_INVOCATION.name]: POSTMAN_GENERATOR_INVOCATION,
    [OPENAPI_GENERATOR_INVOCATION.name]: OPENAPI_GENERATOR_INVOCATION,
};
