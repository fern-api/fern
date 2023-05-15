export const GeneratorName = {
    TYPESCRIPT: "fernapi/fern-typescript",
    TYPESCRIPT_SDK: "fernapi/fern-typescript-sdk",
    TYPESCRIPT_EXPRESS: "fernapi/fern-typescript-express",
    JAVA: "fernapi/fern-java",
    JAVA_MODEL: "fernapi/java-model",
    JAVA_SDK: "fernapi/fern-java-sdk",
    JAVA_SPRING: "fernapi/fern-java-spring",
    PYTHON_FASTAPI: "fernapi/fern-fastapi-server",
    PYTHON_PYDANTIC: "fernapi/fern-pydantic-model",
    PYTHON_SDK: "fernapi/fern-python-sdk",
    GO: "fernapi/fern-go",
    OPENAPI: "fernapi/fern-openapi",
    STOPLIGHT: "fernapi/fern-stoplight",
    POSTMAN: "fernapi/fern-postman",
    OPENAPI_PYTHON_CLIENT: "fernapi/openapi-python-client",
} as const;

export type GeneratorName = typeof GeneratorName[keyof typeof GeneratorName];
