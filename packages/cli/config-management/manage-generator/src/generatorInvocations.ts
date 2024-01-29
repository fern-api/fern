import { GeneratorInvocationSchema, GeneratorName } from "@fern-api/generators-configuration";

export const GENERATOR_INVOCATIONS: Record<GeneratorName, Omit<GeneratorInvocationSchema, "name">> = {
    [GeneratorName.JAVA_MODEL]: {
        version: "0.6.1",
        output: {
            location: "local-file-system",
            path: "../generated/models/java"
        }
    },
    [GeneratorName.JAVA_SDK]: {
        version: "0.6.1",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/java"
        }
    },
    [GeneratorName.JAVA_SPRING]: {
        version: "0.6.1",
        output: {
            location: "local-file-system",
            path: "../src/main/java/com/fern"
        },
        config: {
            "package-prefix": "com.fern"
        }
    },
    //deprecated
    [GeneratorName.JAVA]: {
        version: "0.0.122"
    },
    [GeneratorName.TYPESCRIPT_EXPRESS]: {
        version: "0.9.5",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    //deprecated
    [GeneratorName.TYPESCRIPT]: {
        version: "0.9.5"
    },
    //deprecated
    [GeneratorName.TYPESCRIPT_SDK]: {
        version: "0.9.5",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/typescript"
        }
    },
    [GeneratorName.TYPESCRIPT_NODE_SDK]: {
        version: "0.9.5",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/typescript"
        }
    },
    [GeneratorName.TYPESCRIPT_BROWSER_SDK]: {
        version: "0.9.5",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/typescript-browser"
        }
    },
    [GeneratorName.PYTHON_PYDANTIC]: {
        version: "0.7.7",
        output: {
            location: "local-file-system",
            path: "../generated/models/pydantic"
        }
    },
    [GeneratorName.PYTHON_FASTAPI]: {
        version: "0.7.7",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.PYTHON_SDK]: {
        version: "0.8.1",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/python"
        }
    },
    [GeneratorName.GO_FIBER]: {
        version: "0.10.0"
    },
    [GeneratorName.GO_MODEL]: {
        version: "0.10.0",
        output: {
            location: "local-file-system",
            path: "../generated/models/go"
        }
    },
    [GeneratorName.GO_SDK]: {
        version: "0.10.0",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/go"
        },
        config: {
            importPath: "go-mod-path/generated/sdks/go"
        }
    },
    [GeneratorName.RUBY_MODEL]: {
        version: "0.0.1",
        output: {
            location: "local-file-system",
            path: "../generated/models/ruby"
        }
    },
    [GeneratorName.RUBY_SDK]: {
        version: "0.0.1",
        output: {
            location: "local-file-system",
            path: "../generated/sdks/ruby"
        }
    },
    [GeneratorName.OPENAPI]: {
        version: "0.0.30",
        config: {
            format: "yaml"
        },
        output: {
            location: "local-file-system",
            path: "../generated/openapi"
        }
    },
    [GeneratorName.POSTMAN]: {
        version: "0.0.46",
        output: {
            location: "local-file-system",
            path: "../generated/postman"
        }
    },
    //deprecated
    [GeneratorName.OPENAPI_PYTHON_CLIENT]: {
        version: "0.0.11",
        output: {
            location: "local-file-system",
            path: "../generated/python"
        },
        config: {
            format: "yaml"
        }
    },
    //deprecated
    [GeneratorName.STOPLIGHT]: {
        version: "0.0.24",
        config: {
            format: "yaml"
        }
    }
};
