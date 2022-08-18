import { GeneratorInvocationSchema, GeneratorsConfigurationSchema } from "@fern-api/generators-configuration";
import {
    JAVA_GENERATOR_INVOCATION,
    OPENAPI_GENERATOR_INVOCATION,
    POSTMAN_GENERATOR_INVOCATION,
    TYPESCRIPT_GENERATOR_INVOCATION,
} from "./generatorInvocations";

export type GeneratorAddResult = GeneratorAddedResult | undefined;

export interface GeneratorAddedResult {
    updatedGeneratorsConfiguration: GeneratorsConfigurationSchema;
    addedInvocation: GeneratorInvocationSchema;
}

export function addOpenApiGenerator(generatorsConfiguration: GeneratorsConfigurationSchema): GeneratorAddResult {
    return addGeneratorIfNotPresent({
        generatorsConfiguration,
        invocation: OPENAPI_GENERATOR_INVOCATION,
    });
}

export function addJavaGenerator(generatorsConfiguration: GeneratorsConfigurationSchema): GeneratorAddResult {
    return addGeneratorIfNotPresent({
        generatorsConfiguration,
        invocation: JAVA_GENERATOR_INVOCATION,
    });
}

export function addTypescriptGenerator(generatorsConfiguration: GeneratorsConfigurationSchema): GeneratorAddResult {
    return addGeneratorIfNotPresent({
        generatorsConfiguration,
        invocation: TYPESCRIPT_GENERATOR_INVOCATION,
    });
}

export function addPostmanGenerator(generatorsConfiguration: GeneratorsConfigurationSchema): GeneratorAddResult {
    return addGeneratorIfNotPresent({
        generatorsConfiguration,
        invocation: POSTMAN_GENERATOR_INVOCATION,
    });
}

function addGeneratorIfNotPresent({
    generatorsConfiguration,
    invocation,
}: {
    generatorsConfiguration: GeneratorsConfigurationSchema;
    invocation: GeneratorInvocationSchema;
}): GeneratorAddResult {
    const isAlreadyInstalled = generatorsConfiguration.generators.some(
        (otherInvocation) => otherInvocation.name === invocation.name
    );
    if (isAlreadyInstalled) {
        return undefined;
    }
    return {
        updatedGeneratorsConfiguration: {
            generators: [...generatorsConfiguration.generators, invocation],
        },
        addedInvocation: invocation,
    };
}
