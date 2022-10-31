import { DraftGeneratorInvocationSchema } from "@fern-api/generators-configuration";

export const JAVA_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-java-sdk",
    version: "0.0.122",
    mode: "publish",
};

export const TYPESCRIPT_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-typescript-sdk",
    version: "0.0.227",
    mode: "publish",
};

export const POSTMAN_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-postman",
    version: "0.0.25",
    mode: "download-files",
    "output-path": "./generated-postman",
};

export const OPENAPI_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-openapi",
    version: "0.0.10",
    config: {
        format: "yaml",
    },
    mode: "download-files",
    "output-path": "./generated-openapi",
};

export const GENERATOR_INVOCATIONS: Record<string, DraftGeneratorInvocationSchema> = {
    [JAVA_GENERATOR_INVOCATION.name]: JAVA_GENERATOR_INVOCATION,
    [TYPESCRIPT_GENERATOR_INVOCATION.name]: TYPESCRIPT_GENERATOR_INVOCATION,
    [POSTMAN_GENERATOR_INVOCATION.name]: POSTMAN_GENERATOR_INVOCATION,
    [OPENAPI_GENERATOR_INVOCATION.name]: OPENAPI_GENERATOR_INVOCATION,
};
