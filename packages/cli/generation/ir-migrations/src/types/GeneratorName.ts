export const GeneratorName = {
    TYPESCRIPT: "fernapi/fern-typescript",
    JAVA: "fernapi/fern-java",
    PYTHON: "fernapi/fern-python",
    OPENAPI: "fernapi/fern-openapi",
    POSTMAN: "fernapi/fern-postman",
} as const;

export type GeneratorName = typeof GeneratorName[keyof typeof GeneratorName];
