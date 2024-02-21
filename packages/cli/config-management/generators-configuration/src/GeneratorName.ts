export const GeneratorName = {
    TYPESCRIPT: "fernapi/fern-typescript",
    TYPESCRIPT_SDK: "fernapi/fern-typescript-sdk",
    TYPESCRIPT_NODE_SDK: "fernapi/fern-typescript-node-sdk",
    TYPESCRIPT_BROWSER_SDK: "fernapi/fern-typescript-browser-sdk",
    TYPESCRIPT_EXPRESS: "fernapi/fern-typescript-express",
    JAVA: "fernapi/fern-java",
    JAVA_MODEL: "fernapi/java-model",
    JAVA_SDK: "fernapi/fern-java-sdk",
    JAVA_SPRING: "fernapi/fern-java-spring",
    PYTHON_FASTAPI: "fernapi/fern-fastapi-server",
    PYTHON_PYDANTIC: "fernapi/fern-pydantic-model",
    PYTHON_SDK: "fernapi/fern-python-sdk",
    GO_MODEL: "fernapi/fern-go-model",
    GO_SDK: "fernapi/fern-go-sdk",
    GO_FIBER: "fernapi/fern-go-fiber",
    RUBY_MODEL: "fernapi/fern-ruby-model",
    RUBY_SDK: "fernapi/fern-ruby-sdk",
    CSHARP_MODEL: "fernapi/fern-csharp-model",
    CSHARP_SDK: "fernapi/fern-csharp-sdk",
    OPENAPI: "fernapi/fern-openapi",
    STOPLIGHT: "fernapi/fern-stoplight",
    POSTMAN: "fernapi/fern-postman",
    OPENAPI_PYTHON_CLIENT: "fernapi/openapi-python-client"
} as const;

export type GeneratorName = typeof GeneratorName[keyof typeof GeneratorName];
