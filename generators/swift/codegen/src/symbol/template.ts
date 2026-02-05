import { assertString } from "@fern-api/core-utils";

export interface TemplateFileSpec {
    relativePath: string;
    filenameWithoutExtension: (templateData: Record<string, unknown>) => string;
}

export const SourceTemplateFileSpecs = {
    ClientError: {
        relativePath: "",
        filenameWithoutExtension: (templateData) => {
            assertString(templateData.errorEnumName);
            return templateData.errorEnumName;
        }
    },
    // Core/Networking
    HTTPClient: {
        relativePath: "Core/Networking",
        filenameWithoutExtension: () => "HTTPClient"
    }
} satisfies Record<string, TemplateFileSpec>;

export type SourceTemplateFileId = keyof typeof SourceTemplateFileSpecs;
