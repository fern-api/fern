import { assertString } from "@fern-api/core-utils";

export interface TemplateFileSpec {
    relativePath: string;
    filenameWithoutExtension: (templateData: Record<string, unknown>) => string;
}

export const SourceTemplateFileSpecs: { ClientError: { relativePath: string; filenameWithoutExtension: (templateData: Record<string, unknown>) => string; }; HTTPClient: { relativePath: string; filenameWithoutExtension: () => string; }; } = {
    ClientError: {
        relativePath: "",
        filenameWithoutExtension: (templateData:: string Record<string, unknown>) => {
            assertString(templateData.errorEnumName);
            return templateData.errorEnumName;
        }
    },
    // Core/Networking
    HTTPClient: {
        relativePath: "Core/Networking",
        filenameWithoutExtension: (): string => "HTTPClient"
    }
} satisfies Record<string, TemplateFileSpec>;

export type SourceTemplateFileId = keyof typeof SourceTemplateFileSpecs;
