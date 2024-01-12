import { GeneratorInvocationSchema, GeneratorName } from "@fern-api/generators-configuration";

export const GENERATOR_INVOCATIONS: Record<GeneratorName, Omit<GeneratorInvocationSchema, "name">> = {
    [GeneratorName.JAVA]: {
        version: "0.0.122"
    },
    [GeneratorName.TYPESCRIPT_EXPRESS]: {
        version: "0.9.0",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.JAVA_MODEL]: {
        version: "0.5.7"
    },
    [GeneratorName.JAVA_SDK]: {
        version: "0.5.7"
    },
    [GeneratorName.JAVA_SPRING]: {
        version: "0.5.7",
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
        version: "0.9.0",
        output: {
            location: "local-file-system",
            path: "../generated/sdk/node"
        }
    },
    [GeneratorName.TYPESCRIPT_BROWSER_SDK]: {
        version: "0.9.0",
        output: {
            location: "local-file-system",
            path: "../generated/sdk/browser"
        }
    },
    [GeneratorName.PYTHON_PYDANTIC]: {
        version: "0.7.6"
    },
    [GeneratorName.PYTHON_FASTAPI]: {
        version: "0.7.6",
        output: {
            location: "local-file-system",
            path: "../src/fern"
        }
    },
    [GeneratorName.PYTHON_SDK]: {
        version: "0.7.6",
        output: {
            location: "local-file-system",
            path: "../generated/sdk/python"
        }
    },
    [GeneratorName.GO_FIBER]: {
        version: "0.9.4"
    },
    [GeneratorName.GO_MODEL]: {
        version: "0.9.4"
    },
    [GeneratorName.GO_SDK]: {
        version: "0.9.4",
        output: {
            location: "local-file-system",
            path: "../generated/sdk/go"
        },
        config: {
            importPath: "go-mod-path/generated/go"
        }
    },
    [GeneratorName.OPENAPI]: {
        version: "0.0.30-rc0",
        config: {
            format: "yaml"
        },
        output: {
            location: "local-file-system",
            path: "../generated/openapi"
        }
    },
    [GeneratorName.STOPLIGHT]: {
        version: "0.0.24",
        config: {
            format: "yaml"
        }
    },
    [GeneratorName.POSTMAN]: {
        version: "0.0.46",
        output: {
            location: "local-file-system",
            path: "../generated/postman"
        }
    },
    [GeneratorName.OPENAPI_PYTHON_CLIENT]: {
        version: "0.0.11",
        output: {   
            location: "local-file-system",
            path: "../generated/python"
        },
        config: {
            format: "yaml"
        }
    }
};
