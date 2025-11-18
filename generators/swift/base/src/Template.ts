import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";

export interface TemplateDefinition {
    name: string;
    directory: RelativeFilePath;
    filenameWithoutExtension: (templateData: Record<string, unknown>) => string;
    symbols: { name: (templateData: Record<string, unknown>) => string; shape: swift.TypeSymbolShape }[];
    loadContents: () => Promise<string>;
}

export interface TemplateFileSpec {
    name: string;
    relativePath: string;
    filenameWithoutExtension: (templateData: Record<string, unknown>) => string;
    symbols: { name: (templateData: Record<string, unknown>) => string; shape: swift.TypeSymbolShape }[];
}

export const SourceTemplateFileSpecs: Record<string, TemplateFileSpec> = {};

export type SourceTemplateFileId = keyof typeof SourceTemplateFileSpecs;

export type SourceTemplateDefinitionsById = {
    [K in SourceTemplateFileId]: TemplateDefinition;
};

export const SourceTemplateFiles = createSourceTemplateFiles();

function createSourceTemplateFiles(): SourceTemplateDefinitionsById {
    const result = {} as SourceTemplateDefinitionsById;

    for (const [key, spec] of entries(SourceTemplateFileSpecs)) {
        const { name, relativePath, filenameWithoutExtension, symbols } = spec as TemplateFileSpec;
        result[key] = {
            name,
            directory: RelativeFilePath.of(relativePath),
            filenameWithoutExtension,
            symbols: symbols ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "template", "Sources", name + ".Template.swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}

const TestTemplateFileSpecs = {
    // Core
    ClientErrorTests: {
        name: "ClientErrorTests",
        relativePath: "Core",
        filenameWithoutExtension: () => "ClientErrorTests",
        symbols: [{ name: () => "ClientErrorTests", shape: { type: "struct" } }]
    },
    ClientRetryTests: {
        name: "ClientRetryTests",
        relativePath: "Core",
        filenameWithoutExtension: () => "ClientRetryTests",
        symbols: [{ name: () => "ClientRetryTests", shape: { type: "struct" } }]
    },
    // Utilities
    HTTPStub: {
        name: "HTTPStub",
        relativePath: "Utilities",
        filenameWithoutExtension: () => "HTTPStub",
        symbols: [{ name: () => "HTTPStub", shape: { type: "class" } }]
    }
} satisfies Record<string, TemplateFileSpec>;

export type TestTemplateFileId = keyof typeof TestTemplateFileSpecs;

export type TestTemplateDefinitionsById = {
    [K in TestTemplateFileId]: TemplateDefinition;
};

export const TestTemplateFiles = createTestTemplateFiles();

function createTestTemplateFiles(): TestTemplateDefinitionsById {
    const result = {} as TestTemplateDefinitionsById;

    for (const [key, spec] of entries(TestTemplateFileSpecs)) {
        const { name, relativePath, filenameWithoutExtension, symbols } = spec as TemplateFileSpec;
        result[key] = {
            name,
            directory: RelativeFilePath.of(relativePath),
            filenameWithoutExtension,
            symbols: symbols ?? [],
            loadContents: () => {
                const absolutePath = join(__dirname, "template", "Tests", name + ".Template.swift");
                return readFile(absolutePath, "utf-8");
            }
        };
    }

    return result;
}
