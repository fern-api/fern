export const GeneratorName = {
    TYPESCRIPT: "fernapi/fern-typescript",
    TYPESCRIPT_SDK: "fernapi/fern-typescript-sdk",
    JAVA: "fernapi/fern-java",
    JAVA_MODEL: "fernapi/java-model",
    JAVA_SDK: "fernapi/fern-java-sdk",
    PYTHON_FASTAPI: "fernapi/fern-fastapi-server",
    PYTHON_PYDANTIC: "fernapi/fern-pydantic-model",
    OPENAPI: "fernapi/fern-openapi",
    POSTMAN: "fernapi/fern-postman",
} as const;

export type GeneratorName = typeof GeneratorName[keyof typeof GeneratorName];
