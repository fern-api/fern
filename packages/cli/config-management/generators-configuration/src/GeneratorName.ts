export const GeneratorName = {
    TYPESCRIPT_NODE_SDK: "fernapi/fern-typescript-node-sdk",
    TYPESCRIPT_BROWSER_SDK: "fernapi/fern-typescript-browser-sdk",
    TYPESCRIPT_EXPRESS: "fernapi/fern-typescript-express",
    JAVA_MODEL: "fernapi/java-model",
    JAVA_SDK: "fernapi/fern-java-sdk",
    JAVA_SPRING: "fernapi/fern-java-spring",
    PYTHON_FASTAPI: "fernapi/fern-fastapi-server",
    PYTHON_PYDANTIC: "fernapi/fern-pydantic-model",
    PYTHON_SDK: "fernapi/fern-python-sdk",
    GO_MODEL: "fernapi/fern-go-model",
    GO_SDK: "fernapi/fern-go-sdk",
    GO_FIBER: "fernapi/fern-go-fiber",
    OPENAPI: "fernapi/fern-openapi",
    POSTMAN: "fernapi/fern-postman",
} as const;

export type GeneratorName = typeof GeneratorName[keyof typeof GeneratorName];
