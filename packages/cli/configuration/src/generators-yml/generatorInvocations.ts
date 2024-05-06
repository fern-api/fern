import { GeneratorName } from "./GeneratorName";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";

export const GENERATOR_INVOCATIONS: Record<GeneratorName, Omit<GeneratorInvocationSchema, "version" | "name">> = {
    [GeneratorName.JAVA]: {},
    [GeneratorName.TYPESCRIPT_EXPRESS]: {
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.JAVA_MODEL]: {},
    [GeneratorName.JAVA_SDK]: {},
    [GeneratorName.JAVA_SPRING]: {
        output: {
            location: "local-file-system",
            path: "../src/main/java/com/fern"
        },
        config: {
            "package-prefix": "com.fern"
        }
    },
    [GeneratorName.TYPESCRIPT]: {},
    [GeneratorName.TYPESCRIPT_SDK]: {},
    [GeneratorName.TYPESCRIPT_NODE_SDK]: {
        output: {
            location: "local-file-system",
            path: "../sdks/typescript"
        }
    },
    [GeneratorName.TYPESCRIPT_BROWSER_SDK]: {
        output: {
            location: "local-file-system",
            path: "../sdks/typescript"
        }
    },
    [GeneratorName.PYTHON_PYDANTIC]: {},
    [GeneratorName.PYTHON_FASTAPI]: {
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.PYTHON_SDK]: {
        output: {
            location: "local-file-system",
            path: "../sdks/python"
        }
    },
    [GeneratorName.GO_FIBER]: {},
    [GeneratorName.GO_MODEL]: {},
    [GeneratorName.GO_SDK]: {
        output: {
            location: "local-file-system",
            path: "../sdks/go"
        },
        config: {
            importPath: "go-mod-path/generated/go"
        }
    },
    [GeneratorName.RUBY_MODEL]: {},
    [GeneratorName.RUBY_SDK]: {
        output: {
            location: "local-file-system",
            path: "../sdks/ruby"
        }
    },
    [GeneratorName.OPENAPI]: {
        config: {
            format: "yaml"
        },
        output: {
            location: "local-file-system",
            path: "../openapi"
        }
    },
    [GeneratorName.STOPLIGHT]: {
        config: {
            format: "yaml"
        }
    },
    [GeneratorName.POSTMAN]: {
        output: {
            location: "local-file-system",
            path: "../postman"
        }
    },
    [GeneratorName.OPENAPI_PYTHON_CLIENT]: {
        output: {
            location: "local-file-system",
            path: "../sdks/python"
        },
        config: {
            format: "yaml"
        }
    },
    [GeneratorName.CSHARP_MODEL]: {},
    [GeneratorName.CSHARP_SDK]: {
        output: {
            location: "local-file-system",
            path: "../sdks/csharp"
        }
    }
};
