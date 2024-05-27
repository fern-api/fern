import { GeneratorName } from "./GeneratorName";
import { GeneratorInvocationSchema } from "./schemas/GeneratorInvocationSchema";

export const GENERATOR_INVOCATIONS: Record<GeneratorName, Omit<GeneratorInvocationSchema, "name">> = {
    [GeneratorName.JAVA]: {
        version: "0.0.122"
    },
    [GeneratorName.TYPESCRIPT_EXPRESS]: {
        version: "0.7.2",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.JAVA_MODEL]: {
        version: "0.5.7"
    },
    [GeneratorName.JAVA_SDK]: {
        version: "0.9.3"
    },
    [GeneratorName.JAVA_SPRING]: {
        version: "0.8.0-rc0",
        output: {
            location: "local-file-system",
            path: "../src/main/java/com/fern"
        },
        config: {
            "package-prefix": "com.fern"
        }
    },
    [GeneratorName.TYPESCRIPT]: {
        version: "0.7.2"
    },
    [GeneratorName.TYPESCRIPT_SDK]: {
        version: "0.7.2"
    },
    [GeneratorName.TYPESCRIPT_NODE_SDK]: {
        version: "0.20.0-rc1",
        output: {
            location: "local-file-system",
            path: "../sdks/typescript"
        }
    },
    [GeneratorName.TYPESCRIPT_BROWSER_SDK]: {
        version: "0.9.5",
        output: {
            location: "local-file-system",
            path: "../sdks/typescript"
        }
    },
    [GeneratorName.PYTHON_PYDANTIC]: {
        version: "0.9.0"
    },
    [GeneratorName.PYTHON_FASTAPI]: {
        version: "0.9.2",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.PYTHON_SDK]: {
        version: "2.5.3",
        output: {
            location: "local-file-system",
            path: "../sdks/python"
        }
    },
    [GeneratorName.GO_FIBER]: {
        version: "0.9.0"
    },
    [GeneratorName.GO_MODEL]: {
        version: "0.9.0"
    },
    [GeneratorName.GO_SDK]: {
        version: "0.22.0",
        output: {
            location: "local-file-system",
            path: "../sdks/go"
        },
        config: {
            importPath: "go-mod-path/generated/go"
        }
    },
    [GeneratorName.RUBY_MODEL]: {
        version: "0.0.8"
    },
    [GeneratorName.RUBY_SDK]: {
        version: "0.6.2",
        output: {
            location: "local-file-system",
            path: "../sdks/ruby"
        }
    },
    [GeneratorName.OPENAPI]: {
        version: "0.0.31",
        config: {
            format: "yaml"
        },
        output: {
            location: "local-file-system",
            path: "../openapi"
        }
    },
    [GeneratorName.POSTMAN]: {
        version: "0.1.1",
        output: {
            location: "local-file-system",
            path: "../postman"
        }
    },
    [GeneratorName.CSHARP_MODEL]: {
        version: "0.0.2"
    },
    [GeneratorName.CSHARP_SDK]: {
        version: "0.0.16",
        output: {
            location: "local-file-system",
            path: "../sdks/csharp"
        }
    }
};
