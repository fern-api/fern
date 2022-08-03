import { GeneratorInvocationSchema, WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";

const JAVA_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-java",
    version: "0.0.84",
    generate: true,
    config: {
        packagePrefix: "com",
        mode: "client_and_server",
    },
};

const TYPESCRIPT_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-typescript",
    version: "0.0.155",
    generate: true,
    config: {
        mode: "client_and_server",
    },
};

const POSTMAN_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
    name: "fernapi/fern-postman",
    version: "0.0.21",
    generate: {
        enabled: true,
        output: "./generated-postman.json",
    },
};

const OPENAPI_GENERATOR_INVOCATION: GeneratorInvocationSchema = {
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

export function addOpenApiGenerator(
    workspaceConfiguration: WorkspaceConfigurationSchema
): WorkspaceConfigurationSchema {
    return addGeneratorIfNotPresent({
        workspaceConfiguration,
        invocation: OPENAPI_GENERATOR_INVOCATION,
    });
}

export function addJavaGenerator(workspaceConfiguration: WorkspaceConfigurationSchema): WorkspaceConfigurationSchema {
    return addGeneratorIfNotPresent({
        workspaceConfiguration,
        invocation: JAVA_GENERATOR_INVOCATION,
    });
}

export function addTypescriptGenerator(
    workspaceConfiguration: WorkspaceConfigurationSchema
): WorkspaceConfigurationSchema {
    return addGeneratorIfNotPresent({
        workspaceConfiguration,
        invocation: TYPESCRIPT_GENERATOR_INVOCATION,
    });
}

export function addPostmanGenerator(
    workspaceConfiguration: WorkspaceConfigurationSchema
): WorkspaceConfigurationSchema {
    return addGeneratorIfNotPresent({
        workspaceConfiguration,
        invocation: POSTMAN_GENERATOR_INVOCATION,
    });
}

function addGeneratorIfNotPresent({
    workspaceConfiguration,
    invocation,
}: {
    workspaceConfiguration: WorkspaceConfigurationSchema;
    invocation: GeneratorInvocationSchema;
}): WorkspaceConfigurationSchema {
    const isAlreadyInstalled = workspaceConfiguration.generators.some(
        (otherInvocation) => otherInvocation.name === invocation.name
    );
    if (isAlreadyInstalled) {
        return workspaceConfiguration;
    }
    return {
        ...workspaceConfiguration,
        generators: [...workspaceConfiguration.generators, invocation],
    };
}
