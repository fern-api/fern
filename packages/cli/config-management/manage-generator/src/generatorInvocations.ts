import { GeneratorInvocationSchema } from "@fern-api/generators-configuration";

export const JAVA_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-java-sdk",
    version: "0.0.122",
};

export const TYPESCRIPT_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-typescript-sdk",
    version: "0.0.241",
};

export const POSTMAN_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-postman",
    version: "0.0.25",
};

export const OPENAPI_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-openapi",
    version: "0.0.11",
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
