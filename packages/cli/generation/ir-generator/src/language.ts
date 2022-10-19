import { Values } from "@fern-api/core-utils";

export const Language = {
    TYPESCRIPT: "typescript",
    JAVA: "java",
    PYTHON: "python",
} as const;

export type Language = Values<typeof Language>;
