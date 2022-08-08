import { GeneratorInvocationSchema, WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import {
    JAVA_GENERATOR_INVOCATION,
    OPENAPI_GENERATOR_INVOCATION,
    POSTMAN_GENERATOR_INVOCATION,
    TYPESCRIPT_GENERATOR_INVOCATION,
} from "./generatorInvocations";

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
