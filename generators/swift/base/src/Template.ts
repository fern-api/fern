import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";

export interface TemplateDefinition {
    id: string;
    directory: RelativeFilePath;
    filenameWithoutExtension: (templateData: Record<string, unknown>) => string;
    loadContents: () => Promise<string>;
}

export type SourceTemplateDefinitionsById = {
    [K in swift.SourceTemplateFileId]: TemplateDefinition;
};

export const SourceTemplateFiles = createSourceTemplateFiles();

function createSourceTemplateFiles(): SourceTemplateDefinitionsById {
    const result = {} as SourceTemplateDefinitionsById;

    for (const [templateFileId, spec] of entries(swift.SourceTemplateFileSpecs)) {
        const { relativePath, filenameWithoutExtension } = spec as swift.TemplateFileSpec;
        result[templateFileId] = {
            id: templateFileId,
            directory: RelativeFilePath.of(relativePath),
            filenameWithoutExtension,
            loadContents: () => {
                const absolutePath = join(__dirname, "template", "Sources", templateFileId + ".Template.swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}

const TestTemplateFileSpecs = {
    // Core
    ClientErrorTests: {
        relativePath: "Core",
        filenameWithoutExtension: () => "ClientErrorTests"
    },
    ClientRetryTests: {
        relativePath: "Core",
        filenameWithoutExtension: () => "ClientRetryTests"
    },
    // Utilities
    HTTPStub: {
        relativePath: "Utilities",
        filenameWithoutExtension: () => "HTTPStub"
    }
} satisfies Record<string, swift.TemplateFileSpec>;

export type TestTemplateFileId = keyof typeof TestTemplateFileSpecs;

export type TestTemplateDefinitionsById = {
    [K in TestTemplateFileId]: TemplateDefinition;
};

export const TestTemplateFiles = createTestTemplateFiles();

function createTestTemplateFiles(): TestTemplateDefinitionsById {
    const result = {} as TestTemplateDefinitionsById;

    for (const [templateFileId, spec] of entries(TestTemplateFileSpecs)) {
        const { relativePath, filenameWithoutExtension } = spec as swift.TemplateFileSpec;
        result[templateFileId] = {
            id: templateFileId,
            directory: RelativeFilePath.of(relativePath),
            filenameWithoutExtension,
            loadContents: () => {
                const absolutePath = join(__dirname, "template", "Tests", templateFileId + ".Template.swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
