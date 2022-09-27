import { RelativeFilePath } from "@fern-api/core-utils";
import { DraftGeneratorInvocationSchema } from "@fern-api/generators-configuration";

export const JAVA_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/java-client",
    version: "0.0.109",
};

export const TYPESCRIPT_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-typescript",
    version: "0.0.197",
    config: {
        mode: "client-v2",
    },
};

export const POSTMAN_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-postman",
    version: "0.0.23",
    "local-output": RelativeFilePath.of("./generated-postman.json"),
};

export const OPENAPI_GENERATOR_INVOCATION: DraftGeneratorInvocationSchema = {
    name: "fernapi/fern-openapi",
    version: "0.0.6",
    "local-output": RelativeFilePath.of("./generated-openapi.json"),
    config: {
        format: "yaml",
    },
};

export const GENERATOR_INVOCATIONS: Record<string, DraftGeneratorInvocationSchema> = {
    [JAVA_GENERATOR_INVOCATION.name]: JAVA_GENERATOR_INVOCATION,
    [TYPESCRIPT_GENERATOR_INVOCATION.name]: TYPESCRIPT_GENERATOR_INVOCATION,
    [POSTMAN_GENERATOR_INVOCATION.name]: POSTMAN_GENERATOR_INVOCATION,
    [OPENAPI_GENERATOR_INVOCATION.name]: OPENAPI_GENERATOR_INVOCATION,
};
