import { Values } from "@fern-api/core-utils";

export const ReadmeOpenAPIExtension = {
    /**
     * Migrate from readme extensions to fern IR.
     *
     * https://docs.readme.com/main/docs/openapi-extensions
     */
    README_EXT: "x-readme"
};

export type ReadmeOpenAPIExtension = Values<typeof ReadmeOpenAPIExtension>;
