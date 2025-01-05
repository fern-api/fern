import { generatorsYml } from "@fern-api/configuration";

import { GeneratorName } from "./GeneratorName";

export const GENERATOR_INVOCATIONS: Record<GeneratorName, Omit<generatorsYml.GeneratorInvocationSchema, "name">> = {
    [GeneratorName.JAVA]: {
        version: "1.0.5"
    },
    [GeneratorName.TYPESCRIPT_EXPRESS]: {
        version: "0.17.3",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.JAVA_MODEL]: {
        version: "0.9.2"
    },
    [GeneratorName.JAVA_SDK]: {
        version: "1.0.5"
    },
    [GeneratorName.JAVA_SPRING]: {
        version: "0.9.2",
        output: {
            location: "local-file-system",
            path: "../src/main/java/com/fern"
        },
        config: {
            "package-prefix": "com.fern"
        }
    },
    [GeneratorName.TYPESCRIPT]: {
        version: "0.39.3"
    },
    [GeneratorName.TYPESCRIPT_SDK]: {
        version: "0.39.3"
    },
    [GeneratorName.TYPESCRIPT_NODE_SDK]: {
        version: "0.39.3",
        output: {
            location: "local-file-system",
            path: "../sdks/typescript"
        }
    },
    [GeneratorName.TYPESCRIPT_BROWSER_SDK]: {
        version: "0.39.3",
        output: {
            location: "local-file-system",
            path: "../sdks/typescript"
        }
    },
    [GeneratorName.PYTHON_PYDANTIC]: {
        version: "1.4.3"
    },
    [GeneratorName.PYTHON_FASTAPI]: {
        version: "1.4.6",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.PYTHON_SDK]: {
        version: "3.10.6",
        output: {
            location: "local-file-system",
            path: "../sdks/python"
        }
    },
    [GeneratorName.GO_FIBER]: {
        version: "0.23.0"
    },
    [GeneratorName.GO_MODEL]: {
        version: "0.23.0"
    },
    [GeneratorName.GO_SDK]: {
        version: "0.23.0",
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
        version: "0.8.2",
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
    [GeneratorName.STOPLIGHT]: {
        version: "0.0.24",
        config: {
            format: "yaml"
        }
    },
    [GeneratorName.POSTMAN]: {
        version: "0.1.1",
        output: {
            location: "local-file-system",
            path: "../postman"
        }
    },
    [GeneratorName.OPENAPI_PYTHON_CLIENT]: {
        version: "0.0.11",
        output: {
            location: "local-file-system",
            path: "../sdks/python"
        },
        config: {
            format: "yaml"
        }
    },
    [GeneratorName.CSHARP_MODEL]: {
        version: "0.0.2"
    },
    [GeneratorName.CSHARP_SDK]: {
        version: "1.2.1",
        output: {
            location: "local-file-system",
            path: "../sdks/csharp"
        }
    },
    [GeneratorName.SWIFT_MODEL]: {
        version: "0.0.0"
    },
    [GeneratorName.SWIFT_SDK]: {
        version: "0.0.0",
        output: {
            location: "local-file-system",
            path: "../sdks/swift/sdk"
        }
    },
    [GeneratorName.PHP_MODEL]: {
        version: "0.0.0"
    },
    [GeneratorName.PHP_SDK]: {
        version: "0.1.0",
        output: {
            location: "local-file-system",
            path: "../sdks/php/sdk"
        }
    }
};
