import { DraftGeneratorInvocationSchema } from "@fern-api/generators-configuration";
import {
    JAVA_GENERATOR_INVOCATION,
    OPENAPI_GENERATOR_INVOCATION,
    POSTMAN_GENERATOR_INVOCATION,
    TYPESCRIPT_GENERATOR_INVOCATION,
} from "./generatorInvocations";

export type SimpleGeneratorName = "java" | "typescript" | "postman" | "openapi";

export function getGeneratorInvocationFromSimpleName({
    simpleName,
}: {
    simpleName: SimpleGeneratorName;
}): DraftGeneratorInvocationSchema {
    switch (simpleName) {
        case "java":
            return JAVA_GENERATOR_INVOCATION;
        case "typescript":
            return TYPESCRIPT_GENERATOR_INVOCATION;
        case "postman":
            return POSTMAN_GENERATOR_INVOCATION;
        case "openapi":
            return OPENAPI_GENERATOR_INVOCATION;
    }
}
