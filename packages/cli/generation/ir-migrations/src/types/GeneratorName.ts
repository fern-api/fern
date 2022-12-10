export const GeneratorName = {
    TYPESCRIPT: "fernapi/fern-typescript",
    TYPESCRIPT_SDK: "fernapi/fern-typescript-sdk",
    JAVA: "fernapi/fern-java",
    PYTHON: "fernapi/fern-python",
    OPENAPI: "fernapi/fern-openapi",
    POSTMAN: "fernapi/fern-postman",
} as const;

export type GeneratorName = typeof GeneratorName[keyof typeof GeneratorName];
